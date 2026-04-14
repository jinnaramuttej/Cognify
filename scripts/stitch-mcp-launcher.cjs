#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const STITCH_ENDPOINT = 'https://stitch.googleapis.com/mcp';
const PROJECT_ROOT = path.resolve(__dirname, '..');

loadDotEnv(path.join(PROJECT_ROOT, '.env.local'));
loadDotEnv(path.join(PROJECT_ROOT, '.env'));

const apiKey = process.env.STITCH_API_KEY;

if (!apiKey) {
  process.stderr.write('STITCH_API_KEY is not set. Add it to .env.local or the process environment.\n');
  process.exit(1);
}

let inputBuffer = Buffer.alloc(0);
let sessionId = process.env.STITCH_MCP_SESSION_ID || '';
let isDraining = false;
let drainAgain = false;

process.stdin.on('data', (chunk) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk]);
  scheduleDrain().catch((error) => {
    process.stderr.write(`${error.stack || error.message || String(error)}\n`);
  });
});

process.stdin.on('end', () => {
  scheduleDrain().catch((error) => {
    process.stderr.write(`${error.stack || error.message || String(error)}\n`);
    process.exitCode = 1;
  });
});

async function scheduleDrain() {
  if (isDraining) {
    drainAgain = true;
    return;
  }

  isDraining = true;

  try {
    do {
      drainAgain = false;
      await drainMessages();
    } while (drainAgain);
  } finally {
    isDraining = false;
  }
}

async function drainMessages() {
  while (true) {
    const headerEnd = inputBuffer.indexOf('\r\n\r\n');

    if (headerEnd === -1) {
      return;
    }

    const header = inputBuffer.subarray(0, headerEnd).toString('utf8');
    const contentLengthMatch = /content-length:\s*(\d+)/i.exec(header);

    if (!contentLengthMatch) {
      inputBuffer = inputBuffer.subarray(headerEnd + 4);
      continue;
    }

    const contentLength = Number(contentLengthMatch[1]);
    const messageStart = headerEnd + 4;
    const messageEnd = messageStart + contentLength;

    if (inputBuffer.length < messageEnd) {
      return;
    }

    const rawMessage = inputBuffer.subarray(messageStart, messageEnd).toString('utf8');
    inputBuffer = inputBuffer.subarray(messageEnd);

    let message;
    try {
      message = JSON.parse(rawMessage);
    } catch (error) {
      writeMessage({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: `Parse error: ${error.message}`,
        },
      });
      continue;
    }

    try {
      await forwardMessage(message);
    } catch (error) {
      if (!Object.prototype.hasOwnProperty.call(message, 'id')) {
        process.stderr.write(`${error.stack || error.message || String(error)}\n`);
        continue;
      }

      writeMessage({
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -32603,
          message: error.message || String(error),
        },
      });
    }
  }
}

async function forwardMessage(message) {
  const response = await fetch(STITCH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
    },
    body: JSON.stringify(message),
  });

  const nextSessionId = response.headers.get('mcp-session-id');
  if (nextSessionId) {
    sessionId = nextSessionId;
  }

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Stitch MCP returned HTTP ${response.status}: ${responseText}`);
  }

  if (!Object.prototype.hasOwnProperty.call(message, 'id')) {
    return;
  }

  const payloads = parseRemotePayloads(responseText);
  for (const payload of payloads) {
    writeMessage(payload);
  }
}

function parseRemotePayloads(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    return [];
  }

  if (!trimmed.startsWith('event:') && !trimmed.startsWith('data:')) {
    return [JSON.parse(trimmed)];
  }

  return trimmed
    .split(/\r?\n\r?\n/)
    .flatMap((eventBlock) => {
      const data = eventBlock
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n')
        .trim();

      if (!data || data === '[DONE]') {
        return [];
      }

      return [JSON.parse(data)];
    });
}

function writeMessage(message) {
  const body = Buffer.from(JSON.stringify(message), 'utf8');
  process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
  process.stdout.write(body);
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}
