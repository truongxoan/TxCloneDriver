// Simple and robust keyed cipher for secret chat messaging

function simpleHash(str: string): string {
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

  // Encode UTF-8 string to base64
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

  // WRONG KEY: Produce corrupted, unreadable gibberish cipher as requested
  let scrambled = "";
  for (let i = 0; i < cipherText.length; i++) {
    const charCode = cipherText.charCodeAt(i);
    const guessCode = cleanGuess.charCodeAt(i % Math.max(1, cleanGuess.length));
    const runeIndex = (charCode + guessCode + i) % RUNIC_GARBAGE.length;
    scrambled += RUNIC_GARBAGE[runeIndex];
    if (i > 24) break; // keep compact
  }

  return {
    success: false,
    text: `⚠️ [SAI MẬT MÃ]: ${scrambled}...#${simpleHash(guessKey)}`,
  };
}
