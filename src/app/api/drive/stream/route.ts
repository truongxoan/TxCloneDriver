import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/sessionToken";

export async function GET(request: NextRequest) {
  try {
    const __session = await getSessionFromRequest(request);
    if (!__session) {
      return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing file id parameter" }, { status: 400 });
    }

    // Step 1: Initial request to Google Drive download endpoint
    const initialUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download`;
    const res1 = await fetch(initialUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const mimeParam = searchParams.get("mime");
    const contentType1 = res1.headers.get("content-type") || "";

    // If it's already an audio/video or binary stream (e.g. file < 100MB), stream it directly
    if (!contentType1.includes("text/html") && res1.body) {
      const finalType = mimeParam || (contentType1.includes("video") ? contentType1 : contentType1 || "audio/mpeg");
      return new NextResponse(res1.body as any, {
        status: 200,
        headers: {
          "Content-Type": finalType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Step 2: Handle Google's Virus Scan Warning HTML page for large files (> 100MB)
    const htmlText = await res1.text();
    const uuidMatch = htmlText.match(/name="uuid"\s+value="([^"]+)"/);
    const setCookie = res1.headers.get("set-cookie") || "";

    if (!uuidMatch) {
      // If no uuid, file might still be private or inaccessible
      return NextResponse.json(
        {
          error: "Tệp này không thể truy cập công khai. Hãy đảm bảo quyền xem là 'Bất kỳ ai có đường liên kết'.",
        },
        { status: 403 }
      );
    }

    const uuid = uuidMatch[1];
    const confirmUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t&uuid=${uuid}`;

    // Pass Range header if the browser requested a range (for seeking/scrubbing)
    const rangeHeader = request.headers.get("range");

    const res2 = await fetch(confirmUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...(setCookie ? { Cookie: setCookie } : {}),
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      },
    });

    if (!res2.ok || !res2.body) {
      return NextResponse.json(
        { error: `Google Drive trả về mã lỗi: ${res2.status}` },
        { status: res2.status }
      );
    }

    const resContentType = res2.headers.get("content-type") || "audio/mpeg";
    const resContentLength = res2.headers.get("content-length");
    const resContentRange = res2.headers.get("content-range");

    const finalContentType = mimeParam || (resContentType.includes("text/html") ? "audio/mpeg" : resContentType);

    const responseHeaders: Record<string, string> = {
      "Content-Type": finalContentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
    };

    if (resContentLength) responseHeaders["Content-Length"] = resContentLength;
    if (resContentRange) responseHeaders["Content-Range"] = resContentRange;

    return new NextResponse(res2.body as any, {
      status: res2.status, // 200 or 206 Partial Content for seeking
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi phát luồng âm thanh";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
