/**
 * Chống SSRF cho các API proxy: chỉ cho fetch tới domain trong allowlist,
 * chặn tuyệt đối localhost / IP nội bộ / link-local kể cả khi lọt allowlist.
 */
export function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h === "::1" || h === "[::1]") return true;
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [parseInt(ipv4[1], 10), parseInt(ipv4[2], 10)];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  return false;
}

/**
 * @param allowed hosts chính xác ("script.google.com") hoặc hậu tố miền
 *   bắt đầu bằng "." (".googleusercontent.com" khớp mọi subdomain).
 */
export function isUrlAllowed(rawUrl: string, allowed: string[]): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.protocol === "http:" && process.env.NODE_ENV === "production") {
    // Trên production chỉ cho https, trừ khi domain đích tự nó là https-only
    // trong allowlist — đơn giản: chặn http hẳn để tránh downgrade.
    return false;
  }
  const host = url.hostname.toLowerCase();
  if (isPrivateHostname(host)) return false;
  return allowed.some((entry) =>
    entry.startsWith(".") ? host === entry.slice(1) || host.endsWith(entry) : host === entry
  );
}
