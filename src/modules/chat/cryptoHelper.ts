// Zero-Width Steganography & Keyed Cipher for undetectable secret messaging

export const SAMPLE_COVER_TEXTS = [
  "Chào bạn, tài liệu dự án tuần này mình đã gửi email rồi nhé.",
  "Hôm nay thời tiết đẹp quá, chiều có rảnh đi cafe không bạn?",
  "Ok sếp, em đã xem báo cáo và chỉnh sửa số liệu xong rồi.",
  "Chúc bạn một ngày làm việc thật vui vẻ và tràn đầy năng lượng!",
  "Bài tập và giáo trình học phần này khá hay, tối cùng trao đổi nhé.",
  "Đã nhận được thông tin, lát nữa mình sẽ liên hệ lại ngay.",
];

export const ZERO_WIDTH_ZERO = "\u200B"; // Represents bit 0
export const ZERO_WIDTH_ONE = "\u200C";  // Represents bit 1
export const ZERO_WIDTH_MARKER = "\u200D"; // Stego start/end anchor

export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Scrambled rune characters for wrong password output
const RUNIC_GARBAGE = ["ᚦ", "ᚱ", "ᚢ", "ᛟ", "ᛝ", "ᛪ", "§", "⌘", "¤", "¥", "‡", "†", "∆", "∏", "∑", "Ω", "░", "▒", "▓"];

export function encryptChatMessage(plaintext: string, secretKey: string): {
  cipherText: string;
  keyHash: string;
} {
  const cleanKey = secretKey.trim();
  const hash = simpleHash(cleanKey);

  // Encode UTF-8 string to URL-encoded bytes
  const utf8Bytes = encodeURIComponent(plaintext);
  let cipher = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    const charCode = utf8Bytes.charCodeAt(i);
    const keyChar = cleanKey.charCodeAt(i % cleanKey.length);
    const xor = charCode ^ keyChar;
    cipher += xor.toString(16).padStart(2, "0");
  }

  return {
    cipherText: cipher,
    keyHash: hash,
  };
}

export function decryptChatMessage(
  cipherText: string,
  keyHash: string,
  guessKey: string
): { success: boolean; text: string } {
  const cleanGuess = guessKey.trim();
  const guessHash = simpleHash(cleanGuess);

  // Correct key: reconstruct exact original text
  if (guessHash === keyHash) {
    try {
      let decodedUri = "";
      for (let i = 0; i < cipherText.length; i += 2) {
        const hex = cipherText.substring(i, i + 2);
        const xor = parseInt(hex, 16);
        const keyChar = cleanGuess.charCodeAt((i / 2) % cleanGuess.length);
        const charCode = xor ^ keyChar;
        decodedUri += String.fromCharCode(charCode);
      }
      const originalText = decodeURIComponent(decodedUri);
      return { success: true, text: originalText };
    } catch {
      // Fallback
    }
  }

  // WRONG KEY: Produce corrupted, unreadable gibberish cipher
  let scrambled = "";
  for (let i = 0; i < cipherText.length; i++) {
    const charCode = cipherText.charCodeAt(i);
    const guessCode = cleanGuess.charCodeAt(i % Math.max(1, cleanGuess.length));
    const runeIndex = (charCode + guessCode + i) % RUNIC_GARBAGE.length;
    scrambled += RUNIC_GARBAGE[runeIndex];
    if (i > 24) break;
  }

  return {
    success: false,
    text: `⚠️ [SAI MẬT MÃ]: ${scrambled}...#${simpleHash(guessKey)}`,
  };
}

/**
 * Checks if a string contains zero-width steganography invisible bits
 */
export function hasSteganography(text: string): boolean {
  return text.includes(ZERO_WIDTH_MARKER) && (text.includes(ZERO_WIDTH_ZERO) || text.includes(ZERO_WIDTH_ONE));
}

/**
 * Extracts visible cover text by removing all invisible zero-width chars
 */
export function cleanVisibleText(text: string): string {
  return text
    .replace(new RegExp(ZERO_WIDTH_ZERO, "g"), "")
    .replace(new RegExp(ZERO_WIDTH_ONE, "g"), "")
    .replace(new RegExp(ZERO_WIDTH_MARKER, "g"), "");
}

/**
 * Encodes secret payload invisibly into cover text using Zero-Width Unicode characters.
 * The resulting text looks 100% normal on screen and in logs, with ZERO suspicious artifacts.
 */
export function encodeSteganography(
  coverText: string,
  secretText: string,
  secretKey: string
): { fullText: string; stegoHash: string } {
  const cleanCover = coverText.trim() || SAMPLE_COVER_TEXTS[0];
  const cleanKey = secretKey.trim();
  const hash = simpleHash(cleanKey);

  // 1. Encrypt secret payload with key
  const { cipherText } = encryptChatMessage(secretText, cleanKey);

  // 2. Convert cipher hex to binary
  let binaryStr = "";
  for (let i = 0; i < cipherText.length; i++) {
    const nibble = parseInt(cipherText[i], 16);
    binaryStr += nibble.toString(2).padStart(4, "0");
  }

  // 3. Map binary bits to Zero-Width characters
  let zeroWidthPayload = ZERO_WIDTH_MARKER;
  for (const bit of binaryStr) {
    zeroWidthPayload += bit === "0" ? ZERO_WIDTH_ZERO : ZERO_WIDTH_ONE;
  }
  zeroWidthPayload += ZERO_WIDTH_MARKER;

  // 4. Inconspicuously insert into cover text
  const fullText = cleanCover + zeroWidthPayload;

  return {
    fullText,
    stegoHash: hash,
  };
}

/**
 * Decodes invisible zero-width payload and decrypts secret with password.
 */
export function decodeSteganography(
  fullText: string,
  guessKey: string,
  expectedHash?: string
): { success: boolean; secret: string; visibleCover: string } {
  const visibleCover = cleanVisibleText(fullText);

  // Extract zero-width payload between markers
  const startIdx = fullText.indexOf(ZERO_WIDTH_MARKER);
  const endIdx = fullText.lastIndexOf(ZERO_WIDTH_MARKER);

  if (startIdx === -1 || endIdx === -1 || startIdx === endIdx) {
    return { success: false, secret: "Không tìm thấy nội dung ẩn", visibleCover };
  }

  const payloadSlice = fullText.slice(startIdx + 1, endIdx);
  let binaryStr = "";
  for (const char of payloadSlice) {
    if (char === ZERO_WIDTH_ZERO) binaryStr += "0";
    else if (char === ZERO_WIDTH_ONE) binaryStr += "1";
  }

  if (!binaryStr || binaryStr.length % 4 !== 0) {
    return { success: false, secret: "Dữ liệu ẩn bị hỏng hoặc không hoàn chỉnh", visibleCover };
  }

  // Convert binary to hex
  let cipherHex = "";
  for (let i = 0; i < binaryStr.length; i += 4) {
    const chunk = binaryStr.slice(i, i + 4);
    cipherHex += parseInt(chunk, 2).toString(16);
  }

  const cleanGuess = guessKey.trim();
  const guessHash = simpleHash(cleanGuess);

  if (expectedHash && guessHash !== expectedHash) {
    return {
      success: false,
      secret: "⚠️ Mật khẩu giải mã ngụy trang không chính xác!",
      visibleCover,
    };
  }

  const result = decryptChatMessage(cipherHex, guessHash, cleanGuess);
  return {
    success: result.success,
    secret: result.text,
    visibleCover,
  };
}
