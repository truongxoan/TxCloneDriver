import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/sessionToken";
import { isUrlAllowed } from "@/lib/ssrf";

const MAXCHEAPAI_BASE_URL = "https://maxcheapai.com/api";

export async function POST(req: NextRequest) {
  const __session = await getSessionFromRequest(req);
  if (!__session) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { action, apiKey, payload } = body;

    const token = apiKey || process.env.MAXCHEAPAI_API_KEY;

    if (!token && action !== "clean_download") {
      return NextResponse.json(
        {
          success: false,
          error: "Chưa cấu hình MaxCheapAI API Key. Vui lòng nhập API Key trong phần Cài đặt.",
        },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // ACTION 1: Check Account HP & Balance
    if (action === "balance") {
      const res = await fetch(`${MAXCHEAPAI_BASE_URL}/balance`, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        // Fallback for mocked/initial testing if remote endpoint requires custom path
        const errText = await res.text();
        return NextResponse.json({
          success: false,
          error: `Lỗi kết nối MaxCheapAI (${res.status}): ${errText || "Không thể lấy số dư."}`,
        });
      }

      const data = await res.json();
      return NextResponse.json({ success: true, data });
    }

    // ACTION 2: Generate Image (Text-to-Image or Image-to-Image)
    if (action === "images/generate") {
      const res = await fetch(`${MAXCHEAPAI_BASE_URL}/images/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({
          success: false,
          error: `Lỗi tạo ảnh MaxCheapAI (${res.status}): ${errText}`,
        });
      }

      const data = await res.json();
      return NextResponse.json({ success: true, data });
    }

    // ACTION 3: Check Image Task Status
    if (action === "images/status") {
      const { taskId } = payload;
      const res = await fetch(`${MAXCHEAPAI_BASE_URL}/images/${taskId}`, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({
          success: false,
          error: `Lỗi kiểm tra tiến độ ảnh (${res.status}): ${errText}`,
        });
      }

      const data = await res.json();
      return NextResponse.json({ success: true, data });
    }

    // ACTION 4: Generate Video (Image-to-Video / Text-to-Video / Motion Control)
    if (action === "videos/generate") {
      const res = await fetch(`${MAXCHEAPAI_BASE_URL}/videos/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({
          success: false,
          error: `Lỗi tạo video MaxCheapAI (${res.status}): ${errText}`,
        });
      }

      const data = await res.json();
      return NextResponse.json({ success: true, data });
    }

    // ACTION 5: Check Video Task Status
    if (action === "videos/status") {
      const { taskId } = payload;
      const res = await fetch(`${MAXCHEAPAI_BASE_URL}/videos/${taskId}`, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({
          success: false,
          error: `Lỗi kiểm tra tiến độ video (${res.status}): ${errText}`,
        });
      }

      const data = await res.json();
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: "Action không hợp lệ." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi máy chủ proxy MaxCheapAI." },
      { status: 500 }
    );
  }
}

// GET handler to proxy clean image/video downloads without watermarks
export async function GET(req: NextRequest) {
  const __session = await getSessionFromRequest(req);
  if (!__session) {
    return new NextResponse("Chưa đăng nhập.", { status: 401 });
  }
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return new NextResponse("Thiếu tham số url", { status: 400 });
    }
    // SSRF guard: trước đây fetch BẤT KỲ url nào người gọi gửi lên.
    if (!isUrlAllowed(url, [".maxcheapai.com", "maxcheapai.com", "storage.googleapis.com", ".googleusercontent.com", "drive.google.com"])) {
      return new NextResponse("URL không thuộc danh sách được phép.", { status: 400 });
    }

    const mediaRes = await fetch(url);
    if (!mediaRes.ok) {
      return new NextResponse("Không thể tải file gốc", { status: 502 });
    }

    const contentType = mediaRes.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await mediaRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="meamdaosy-ai-${Date.now()}.${
          contentType.includes("video") ? "mp4" : "png"
        }"`,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error: any) {
    return new NextResponse("Lỗi tải file: " + error?.message, { status: 500 });
  }
}
