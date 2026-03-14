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

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  const progress = loadProgress();
  return NextResponse.json(progress[params.userId] || {});
}