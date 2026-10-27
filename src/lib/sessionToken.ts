/**
 * Session token có chữ ký HMAC-SHA256 (dùng chung cho API route Node và
 * middleware Edge qua WebCrypto). Thay cho cookie JSON tự chế trước đây:
 * trình duyệt KHÔNG sửa được role/allowedModules vì mọi thay đổi đều làm
 * chữ ký sai và bị từ chối.
 *
 * Khóa ký lấy từ biến môi trường TX_AUTH_SECRET (đặt trên Vercel).
 * Chưa đặt biến này thì dùng khóa dự phòng trong code — vẫn chặt hơn
 * cookie cũ (httpOnly + hết lộ mật khẩu + hết backdoor), nhưng muốn kín
 * hoàn toàn thì PHẢI đặt TX_AUTH_SECRET, vì repo là public.
 */
export const SESSION_COOKIE = "txclonedriver_session";

const FALLBACK_SECRET = "txclone-fallback-secret-set-TX_AUTH_SECRET-on-vercel";

export interface SessionPayload {
  id: string;
  username: string;
  role: "admin" | "user";
  name: string;
  allowedModules: string[];
  /** username của admin đang đóng vai (nếu có) */
  imp?: string;
  exp: number;
}

function getSecret(): string {
  return process.env.TX_AUTH_SECRET || FALLBACK_SECRET;
}

function b64urlEncodeBytes(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlEncodeText(text: string): string {
  return b64urlEncodeBytes(new TextEncoder().encode(text));
}

function b64urlDecodeToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(
  payload: Omit<SessionPayload, "exp">,
  days = 7
): Promise<string> {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + days * 24 * 60 * 60,
  };
  const body = b64urlEncodeText(JSON.stringify(full));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${b64urlEncodeBytes(new Uint8Array(sig))}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const key = await hmacKey();
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecodeToBytes(sig) as BufferSource,
      new TextEncoder().encode(body)
    );
    if (!ok) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(b64urlDecodeToBytes(body))
    ) as SessionPayload;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    if (!payload.username || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readCookieValue(
  cookieHeader: string | null,
  name: string
): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return undefined;
}

/** Lấy + verify session từ một Request/NextRequest (dùng trong API routes). */
export async function getSessionFromRequest(
  req: Request
): Promise<SessionPayload | null> {
  const token =
    readCookieValue(req.headers.get("cookie"), SESSION_COOKIE) ||
    readCookieValue(req.headers.get("cookie"), "datavault_session");
  return verifySessionToken(token);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};
