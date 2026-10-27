import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { ChatMessage } from "@/modules/chat/types";
import { getSessionFromRequest } from "@/lib/sessionToken";

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "txclonedriver_data")
  : path.join(process.cwd(), "data");

const CHAT_FILE = path.join(DATA_DIR, "chat_messages.json");

function ensureDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readMessages(): ChatMessage[] {
  ensureDirectory();
  try {
    if (fs.existsSync(CHAT_FILE)) {
      const content = fs.readFileSync(CHAT_FILE, "utf-8").replace(/^\uFEFF/, "");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading chat file:", err);
  }
  return [];
}

function writeMessages(messages: ChatMessage[]) {
  ensureDirectory();
  try {
    // Keep last 500 messages to prevent unbounded growth
    const trimmed = messages.slice(-500);
    fs.writeFileSync(CHAT_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing chat file:", err);
  }
}

export async function GET(request: Request) {
  const __session = await getSessionFromRequest(request);
  if (!__session) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập." }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const since = parseInt(searchParams.get("since") || "0", 10);

    const now = Date.now();
    let all = readMessages();

    // Auto-clean any self-destructed messages that expired
    const active = all.filter((m) => {
      if (m.selfDestructSeconds && m.readAt && now > m.readAt + m.selfDestructSeconds * 1000) {
        return false;
      }
      return true;
    });

    if (active.length !== all.length) {
      writeMessages(active);
      all = active;
    }

    const filtered = since > 0 ? all.filter((m) => (m.createdAt || 0) > since) : all;

    return NextResponse.json({
      success: true,
      messages: filtered,
      serverTime: now,
      total: all.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal chat error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const __session = await getSessionFromRequest(request);
  if (!__session) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || !message.text) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu tin nhắn không hợp lệ" },
        { status: 400 }
      );
    }

    // If message is marked ephemeral (RAM-only), do not persist to disk
    if (message.isEphemeral) {
      return NextResponse.json({
        success: true,
        message,
        serverTime: Date.now(),
        ephemeral: true,
      });
    }

    const current = readMessages();
    // Avoid duplicate message IDs
    const exists = current.some((m) => m.id === message.id);
    if (!exists) {
      current.push(message);
      writeMessages(current);
    }

    return NextResponse.json({
      success: true,
      message,
      serverTime: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal chat error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const __session = await getSessionFromRequest(request);
  if (!__session) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, readAt } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing message id" }, { status: 400 });
    }

    const current = readMessages();
    const target = current.find((m) => m.id === id);
    if (target) {
      if (!target.readAt) {
        target.readAt = readAt || Date.now();
        writeMessages(current);
      }
      return NextResponse.json({ success: true, message: target });
    }

    return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal chat error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const __session = await getSessionFromRequest(request);
  if (!__session) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập." }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const target = searchParams.get("target");

    let current = readMessages();

    // Specific message self-destruction
    if (id) {
      current = current.filter((m) => m.id !== id);
      writeMessages(current);
      return NextResponse.json({ success: true, deletedId: id, remaining: current.length });
    }

    if (!target || target === "public") {
      current = current.filter((m) => m.targetUser && m.targetUser !== "public");
    } else {
      current = current.filter(
        (m) => !(m.targetUser === target || m.sender === target)
      );
    }
    writeMessages(current);

    return NextResponse.json({ success: true, count: current.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal chat error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
