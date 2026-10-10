/**
 * Pure TypeScript RFC 6238 Time-based One-Time Password (TOTP) Algorithm
 * 100% compatible with Google Authenticator, Microsoft Authenticator, Authy
 */

// Base32 Alphabet
const RFC4648_BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Decodes a Base32 string into a Uint8Array byte buffer
 */
export function base32Decode(input: string): Uint8Array {
  const cleanInput = input.toUpperCase().replace(/[\s-]/g, "").replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleanInput.length; i++) {
    const val = RFC4648_BASE32_ALPHABET.indexOf(cleanInput[i]);
    if (val === -1) continue; // Skip invalid chars

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

/**
 * Generates a random 16-character Base32 secret key for testing 2FA setup
 */
export function generateRandomTotpSecret(): string {
  let result = "";
  for (let i = 0; i < 16; i++) {
    const idx = Math.floor(Math.random() * RFC4648_BASE32_ALPHABET.length);
    result += RFC4648_BASE32_ALPHABET[idx];
  }
  return result;
}

/**
 * Native SHA-1 implementation in pure TypeScript for immediate synchronous computation
 */
function sha1(bytes: Uint8Array): Uint8Array {
  // Pre-processing
  const msgLength = bytes.length;
  const wordCount = ((msgLength + 8) >> 6) + 1;
  const words = new Uint32Array(wordCount * 16);

  for (let i = 0; i < msgLength; i++) {
    words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }
  words[msgLength >> 2] |= 0x80 << (24 - (msgLength % 4) * 8);
  words[wordCount * 16 - 1] = msgLength * 8;

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const w = new Uint32Array(80);

  for (let i = 0; i < words.length; i += 16) {
    for (let j = 0; j < 16; j++) {
      w[j] = words[i + j];
    }
    for (let j = 16; j < 80; j++) {
      const val = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
      w[j] = (val << 1) | (val >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let j = 0; j < 80; j++) {
      let f = 0;
      let k = 0;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) >>> 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const result = new Uint8Array(20);
  const outWords = [h0, h1, h2, h3, h4];
  for (let i = 0; i < 5; i++) {
    result[i * 4] = (outWords[i] >>> 24) & 255;
    result[i * 4 + 1] = (outWords[i] >>> 16) & 255;
    result[i * 4 + 2] = (outWords[i] >>> 8) & 255;
    result[i * 4 + 3] = outWords[i] & 255;
  }
  return result;
}

/**
 * Computes HMAC-SHA1
 */
function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let formattedKey = new Uint8Array(blockSize);

  if (key.length > blockSize) {
    const hashedKey = sha1(key);
    formattedKey.set(hashedKey);
  } else {
    formattedKey.set(key);
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = formattedKey[i] ^ 0x5c;
    iKeyPad[i] = formattedKey[i] ^ 0x36;
  }

  const innerMsg = new Uint8Array(blockSize + message.length);
  innerMsg.set(iKeyPad);
  innerMsg.set(message, blockSize);
  const innerHash = sha1(innerMsg);

  const outerMsg = new Uint8Array(blockSize + innerHash.length);
  outerMsg.set(oKeyPad);
  outerMsg.set(innerHash, blockSize);
  return sha1(outerMsg);
}

/**
 * Calculates current 6-digit TOTP code and countdown for given secret
 */
export function calculateTotp(
  secretBase32: string,
  timeStepSeconds = 30
): { code: string; secondsRemaining: number; percentRemaining: number } {
  const now = Math.floor(Date.now() / 1000);
  const secondsRemaining = timeStepSeconds - (now % timeStepSeconds);
  const percentRemaining = (secondsRemaining / timeStepSeconds) * 100;

  try {
    const key = base32Decode(secretBase32);
    if (key.length === 0) {
      return { code: "------", secondsRemaining, percentRemaining };
    }

    const counter = Math.floor(now / timeStepSeconds);
    const msg = new Uint8Array(8);
    let tmp = counter;
    for (let i = 7; i >= 0; i--) {
      msg[i] = tmp & 0xff;
      tmp = Math.floor(tmp / 256);
    }

    const hash = hmacSha1(key, msg);
    const offset = hash[19] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const otp = (binary % 1000000).toString().padStart(6, "0");
    return { code: otp, secondsRemaining, percentRemaining };
  } catch {
    return { code: "------", secondsRemaining, percentRemaining };
  }
}
