/**
 * PIN cục bộ do NGƯỜI DÙNG TỰ ĐẶT trên từng thiết bị (thay cho PIN cứng
 * 080497 / khóa master 123e viết sẵn trong code — đã bị xóa vì repo public).
 *
 * Phạm vi thật: đây là khóa giao diện chống nhìn lén trên cùng thiết bị,
 * lưu dạng băm nhẹ trong localStorage. Nó không phải mã hóa dữ liệu và
 * không thay thế đăng nhập server.
 */
const PIN_HASH_KEY = "txclonedriver_local_pin_hash";
const MASTER_KEY_KEY = "txclonedriver_master_key";

function hashPin(pin: string): string {
  const salted = `tx-pin::${pin.trim()}::v1`;
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < salted.length; i++) {
    const c = salted.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + c) | 0;
    h2 = ((h2 << 5) + h2 - c) | 0;
  }
  return `${(h1 >>> 0).toString(16)}.${(h2 >>> 0).toString(16)}`;
}

export function hasLocalPin(): boolean {
  try {
    return !!localStorage.getItem(PIN_HASH_KEY);
  } catch {
    return false;
  }
}

export function setLocalPin(pin: string): boolean {
  const clean = pin.trim();
  if (clean.length < 4) return false;
  try {
    localStorage.setItem(PIN_HASH_KEY, hashPin(clean));
    return true;
  } catch {
    return false;
  }
}

export function verifyLocalPin(pin: string): boolean {
  try {
    const stored = localStorage.getItem(PIN_HASH_KEY);
    if (!stored) return false;
    return stored === hashPin(pin);
  } catch {
    return false;
  }
}

/**
 * Khóa khôi phục tin nhắn do admin TỰ ĐẶT trên thiết bị (không còn khóa
 * master viết sẵn trong code). Chưa đặt thì tính năng khôi phục bằng khóa
 * master tắt hẳn; tin nhắn vẫn mở bằng đúng mật khẩu của chính nó.
 */
export function getLocalMasterKey(): string | null {
  try {
    return localStorage.getItem(MASTER_KEY_KEY);
  } catch {
    return null;
  }
}

export function setLocalMasterKey(key: string): boolean {
  const clean = key.trim();
  if (clean.length < 4) return false;
  try {
    localStorage.setItem(MASTER_KEY_KEY, clean);
    return true;
  } catch {
    return false;
  }
}
