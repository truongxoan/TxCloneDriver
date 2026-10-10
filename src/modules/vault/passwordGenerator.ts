import { PasswordGeneratorOptions, VaultAccount, SecurityAuditResult } from "./types";

const UPPER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // without I, O
const LOWER_CHARS = "abcdefghijkmnopqrstuvwxyz"; // without l
const NUMBER_CHARS = "23456789"; // without 0, 1
const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const AMBIGUOUS_UPPER = "IO";
const AMBIGUOUS_LOWER = "l";
const AMBIGUOUS_NUMBERS = "01";

export function generatePassword(options: PasswordGeneratorOptions): string {
  let charPool = "";

  if (options.useUpper) {
    charPool += options.excludeAmbiguous ? UPPER_CHARS : UPPER_CHARS + AMBIGUOUS_UPPER;
  }
  if (options.useLower) {
    charPool += options.excludeAmbiguous ? LOWER_CHARS : LOWER_CHARS + AMBIGUOUS_LOWER;
  }
  if (options.useNumbers) {
    charPool += options.excludeAmbiguous ? NUMBER_CHARS : NUMBER_CHARS + AMBIGUOUS_NUMBERS;
  }
  if (options.useSymbols) {
    charPool += SYMBOL_CHARS;
  }

  if (!charPool) {
    charPool = LOWER_CHARS + NUMBER_CHARS;
  }

  const length = Math.max(8, Math.min(64, options.length));
  let password = "";

  // Cryptographically secure random values
  const randomBytes = new Uint32Array(length);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 1000000);
    }
  }

  for (let i = 0; i < length; i++) {
    password += charPool[randomBytes[i] % charPool.length];
  }

  return password;
}

/**
 * Calculates strength score (0 to 100) and crack time estimation
 */
export function evaluatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  crackTime: string;
} {
  if (!password) {
    return { score: 0, label: "Rất yếu", color: "text-rose-500", crackTime: "Tức thì" };
  }

  let points = 0;
  const len = password.length;

  if (len >= 8) points += 20;
  if (len >= 12) points += 20;
  if (len >= 16) points += 15;

  if (/[a-z]/.test(password)) points += 10;
  if (/[A-Z]/.test(password)) points += 10;
  if (/[0-9]/.test(password)) points += 10;
  if (/[^a-zA-Z0-9]/.test(password)) points += 15;

  // Deduct for repeats
  if (/^(\w)\1+$/.test(password)) points = Math.min(points, 20);

  const score = Math.min(100, Math.max(10, points));

  if (score < 40) {
    return { score, label: "Yếu", color: "text-rose-400", crackTime: "< 1 phút" };
  } else if (score < 65) {
    return { score, label: "Trung bình", color: "text-amber-400", crackTime: "~ 3 tháng" };
  } else if (score < 85) {
    return { score, label: "Mạnh", color: "text-emerald-400", crackTime: "~ 200 năm" };
  } else {
    return { score, label: "Cực kỳ an toàn", color: "text-cyan-400", crackTime: "> 500 triệu năm" };
  }
}

/**
 * Audits a collection of vault accounts
 */
export function performSecurityAudit(accounts: VaultAccount[]): SecurityAuditResult {
  if (accounts.length === 0) {
    return {
      totalAccounts: 0,
      withTotpCount: 0,
      weakPasswordCount: 0,
      reusedPasswordCount: 0,
      healthScore: 100,
    };
  }

  let withTotpCount = 0;
  let weakPasswordCount = 0;

  const passwordCounts: Record<string, number> = {};

  accounts.forEach((acc) => {
    if (acc.totpSecret) withTotpCount++;

    const strength = evaluatePasswordStrength(acc.password);
    if (strength.score < 50 || acc.password.length < 8) {
      weakPasswordCount++;
    }

    if (acc.password) {
      passwordCounts[acc.password] = (passwordCounts[acc.password] || 0) + 1;
    }
  });

  const reusedPasswordCount = Object.values(passwordCounts).filter((cnt) => cnt > 1).length;

  // Calculate Health Score
  // Base 100: deduct 20 for each weak password ratio, deduct 20 for reused, bonus for 2FA
  const weakRatio = weakPasswordCount / accounts.length;
  const reusedRatio = reusedPasswordCount / accounts.length;
  const totpRatio = withTotpCount / accounts.length;

  let health = 100 - weakRatio * 40 - reusedRatio * 30 + (totpRatio - 0.5) * 20;
  health = Math.round(Math.min(100, Math.max(15, health)));

  return {
    totalAccounts: accounts.length,
    withTotpCount,
    weakPasswordCount,
    reusedPasswordCount,
    healthScore: health,
  };
}
