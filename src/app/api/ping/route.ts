import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "TxCloneDriver",
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage ? Math.round(process.memoryUsage().rss / 1024 / 1024) + "MB" : "N/A",
  }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
