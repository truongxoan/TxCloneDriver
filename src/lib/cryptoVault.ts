/**
 * Web Cryptography API helper for Client-Side AES-GCM (End-to-End Encryption)
 * Used to securely encrypt and decrypt Vault accounts and sensitive passwords
 * using the user's master PIN.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_STRING = "txclonedriver-vault-salt-v1";

async function deriveKey(pin: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(SALT_STRING),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt plaintext string with master PIN using AES-GCM
 * Output format: base64(iv:ciphertext)
 */
export async function encryptData(plainText: string, pin: string): Promise<string> {
  if (typeof window === "undefined" || !crypto?.subtle) {
    return plainText; // Fallback SSR
  }

  try {
    const key = await deriveKey(pin);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encoded = enc.encode(plainText);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );

    const ivStr = btoa(String.fromCharCode.apply(null, Array.from(iv)));
    const ctStr = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(ciphertextBuffer))));
    return `enc_v1:${ivStr}:${ctStr}`;
  } catch (err) {
    console.error("Encryption error:", err);
    return plainText;
  }
}

/**
 * Decrypt ciphertext string with master PIN using AES-GCM
 */
export async function decryptData(cipherTextWithMeta: string, pin: string): Promise<string> {
  if (typeof window === "undefined" || !crypto?.subtle) {
    return cipherTextWithMeta;
  }

  if (!cipherTextWithMeta.startsWith("enc_v1:")) {
    // Legacy plaintext data
    return cipherTextWithMeta;
  }

  try {
    const parts = cipherTextWithMeta.split(":");
    if (parts.length !== 3) return cipherTextWithMeta;

    const ivBytes = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));
    const ctBytes = Uint8Array.from(atob(parts[2]), (c) => c.charCodeAt(0));

    const key = await deriveKey(pin);
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes },
      key,
      ctBytes
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    // Decryption failed (wrong PIN or corrupted)
    return "";
  }
}
