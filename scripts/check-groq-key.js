import fs from 'fs';
import path from 'path';
// use global fetch available in Node 18+

(async function () {
  try {
    // Look for the backend .env in multiple likely locations (robust for different cwd)
    const { fileURLToPath } = await import('url');
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));

    const candidates = [
      path.join(process.cwd(), 'src', 'app', 'ai', 'ai', 'backend', '.env'),
      path.join(scriptDir, '..', 'src', 'app', 'ai', 'ai', 'backend', '.env'),
      path.join(process.cwd(), '..', 'src', 'app', 'ai', 'ai', 'backend', '.env'),
      path.join(process.cwd(), 'src', 'app', 'ai', 'ai', 'backend', '.env')
    ];

    let envPath = null;
    for (const p of candidates) {
      try {
        fs.accessSync(p, fs.constants.R_OK);
        envPath = p;
        break;
      } catch (e) {
        // not found, continue
      }
    }

    if (!envPath) {
      console.error('No backend .env found in expected locations:', candidates);
      process.exit(2);
    }

    console.log('Using .env at:', envPath);
    const raw = fs.readFileSync(envPath, 'utf8');
    const m = raw.match(/^GROQ_API_KEY=(.+)$/m);
    if (!m) {
      console.error('No GROQ_API_KEY found in backend .env at', envPath);
      process.exit(2);
    }
    const key = m[1].trim();

    // Quick DNS check
    try {
      const dns = await import('dns');
      const lookup = await new Promise((resolve, reject) =>
        dns.lookup('api.groq.ai', (err, address, family) => (err ? reject(err) : resolve({ address, family })))
      );
      console.log('DNS ok:', lookup);
    } catch (dErr) {
      console.warn('DNS lookup failed:', dErr && (dErr.message || dErr));
    }

    console.log('Attempting POST to Groq with provided key (masked):', key ? (key.slice(0,6) + '...') : null);

    const res = await fetch('https://api.groq.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'system', content: 'Test' }, { role: 'user', content: 'Hello' }], temperature: 0.1 }),
    });

    if (!res.ok) {
      console.error('Groq API returned status', res.status);
      const text = await res.text();
      console.error('Body:', text.substring(0, 200));
      process.exit(1);
    }

    const js = await res.json();
    console.log('Groq call succeeded. response preview:', JSON.stringify(js?.choices?.[0]?.message?.content ?? js?.reply ?? js).slice(0, 200));
    process.exit(0);
  } catch (err) {
    console.error('Groq test failed (full):', err.stack || err);
    process.exit(1);
  }
})();