import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Compare plain text password against either a bcrypt hash or legacy plaintext string.
 * This guarantees 100% backwards compatibility for existing user records.
 */
export async function verifyPassword(plainText: string, storedPassword?: string): Promise<boolean> {
  if (!storedPassword) return false;
  
  // If stored password is a valid bcrypt hash
  if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
    try {
      return await bcrypt.compare(plainText, storedPassword);
    } catch {
      return false;
    }
  }

  // Fallback for legacy plaintext password (backward compatible)
  return plainText === storedPassword;
}
