import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const progressFile = path.join(process.cwd(), "src", "app", "ai", "ai", "backend", "progress.json");

function loadProgress() {
  try {
    if (!fs.existsSync(progressFile)) {
      fs.writeFileSync(progressFile, "{}");
      return {};
    }
    const raw = fs.readFileSync(progressFile, "utf8").trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    fs.writeFileSync(progressFile, "{}");
    return {};
  }
}

function saveProgress(data: any) {
  fs.writeFileSync(progressFile, JSON.stringify(data, null, 2));
}

function sanitizeHistory(history: any[] = []) {
  return history
    .filter(
      (m) =>
        m && typeof m === "object" && typeof m.role === "string" && typeof m.content === "string"
    )
    .map((m) => ({ role: m.role, content: String(m.content) }));
}

const systemPrompt = `
You are Cognify, an AI tutor.

Rules:
- Teach one concept at a time
- Give examples
- Ask a short quiz question
- If wrong, explain differently
- Be calm and encouraging
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history = [], tutorState = {}, userId = "default" } = body;

    const progress = loadProgress();
    const userProgress = progress[userId] || { subject: null, lessonIndex: 0, stage: "idle" };

    const safeHistory = sanitizeHistory(history);

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Progress: ${JSON.stringify(userProgress)}` },
      ...safeHistory,
      { role: "user", content: String(message) }
    ];

    // Update progress heuristically
    const lower = String(message).toLowerCase();
    if (lower.includes("teach")) {
      userProgress.subject = message;
      userProgress.lessonIndex = 0;
      userProgress.stage = "teaching";
    } else if (lower === "next") {
      userProgress.lessonIndex += 1;
    } else if (lower.includes("quiz")) {
      userProgress.stage = "quiz";
    }

    progress[userId] = userProgress;
    saveProgress(progress);

    // Attempt to get GROQ key from environment or backend .env (local dev fallback)
    const key = (function getGroqKey() {
      if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
      try {
        const envPath = path.join(process.cwd(), "src", "app", "ai", "ai", "backend", ".env");
        const raw = fs.readFileSync(envPath, "utf8");
        const m = raw.match(/^GROQ_API_KEY=(.+)$/m);
        if (m) return m[1].trim();
      } catch (e) {}
      return null;
    })();

    if (key) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`
          },
          body: JSON.stringify({ model: "llama-3.1-8b-instant", messages, temperature: 0.6 })
        });

        const js = await res.json();
        const reply = js?.choices?.[0]?.message?.content ?? js?.reply ?? JSON.stringify(js);

        return NextResponse.json({
          reply,
          tutorState: userProgress,
          demo: false,
          groqReachable: true
        });
      } catch (err) {
        console.error("GROQ call failed:", err);
        const messageText = err instanceof Error ? err.message : (typeof err === 'string' ? err : JSON.stringify(err) || 'Unknown error');
        return NextResponse.json(
          {
            reply: "Tutor failed to reach Groq.",
            tutorState: userProgress,
            error: `Groq unreachable: ${messageText}`,
            demo: false,
            groqReachable: false
          },
          { status: 502 }
        );
      }
    }

    // Fallback demo reply (uses user's message)
    const demoReply = `Demo Cognify: I heard "${String(message)}". Try: "Teach me SQL"`;
    return NextResponse.json({
      reply: demoReply,
      tutorState: userProgress,
      demo: true,
      groqReachable: false
    });

  } catch (err) {
    console.error("/api/ai/chat error:", err);
    return NextResponse.json({ reply: "Tutor failed internally." }, { status: 500 });
  }
}