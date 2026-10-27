import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/sessionToken";
import { isUrlAllowed } from "@/lib/ssrf";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;
  const __session = await getSessionFromRequest(request);
  if (!__session) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập." }, { status: 401 });
  }

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Đường dẫn Google Apps Script không hợp lệ." },
        { status: 400 }
      );
    }

    // SSRF guard: chỉ proxy tới Google Apps Script / Google Drive chính chủ.
    if (!isUrlAllowed(url, ["script.google.com", ".googleusercontent.com", "docs.google.com", "drive.google.com"])) {
      return NextResponse.json(
        { success: false, error: "URL không thuộc danh sách Google được phép." },
        { status: 400 }
      );
    }

    // Call Google Apps Script Web App (follows 302 redirects automatically)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Google Apps Script phản hồi lỗi HTTP ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không thể kết nối tới Google Apps Script.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
