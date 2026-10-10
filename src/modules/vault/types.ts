export type VaultCategory =
  | "all"
  | "email"
  | "social"
  | "server"
  | "banking"
  | "crypto"
  | "work"
  | "other";

export interface VaultAccount {
  id: string;
  title: string;
  url: string;
  username: string;
  password: string;
  totpSecret?: string; // Base32 Secret Key for 2FA Authenticator
  category: VaultCategory;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface PasswordGeneratorOptions {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  excludeAmbiguous: boolean;
}

export interface SecurityAuditResult {
  totalAccounts: number;
  withTotpCount: number;
  weakPasswordCount: number;
  reusedPasswordCount: number;
  healthScore: number; // 0 - 100
}
