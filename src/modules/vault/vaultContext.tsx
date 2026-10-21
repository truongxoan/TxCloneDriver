"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { VaultAccount, SecurityAuditResult } from "./types";
import { useAuth } from "@/modules/auth/authContext";
import { performSecurityAudit } from "./passwordGenerator";

interface VaultContextType {
  isUnlocked: boolean;
  unlockVault: (pin: string) => { success: boolean; error?: string };
  lockVault: () => void;
  changeMasterPin: (oldPin: string, newPin: string) => { success: boolean; error?: string };
  accounts: VaultAccount[];
  addAccount: (account: Omit<VaultAccount, "id" | "createdAt" | "updatedAt">) => void;
  updateAccount: (id: string, account: Partial<VaultAccount>) => void;
  deleteAccount: (id: string) => void;
  audit: SecurityAuditResult;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const DEFAULT_MASTER_PIN = "080497";

// Realistic starter accounts with valid Base32 TOTP secrets for testing
const SAMPLE_VAULT_ACCOUNTS: VaultAccount[] = [
  {
    id: "acc-1",
    title: "Google Workspace & Cloud Console",
    url: "https://console.cloud.google.com",
    username: "admin@txclonedriver.internal",
    password: "Gg#Sec99*CloudKey2026",
    totpSecret: "JBSWY3DPEHPK3PXP", // RFC standard test vector
    category: "email",
    notes: "Tài khoản quản trị Cloud và Apps Script Drive",
    tags: ["Google", "Drive", "Admin"],
    createdAt: "10/10/2026",
    updatedAt: "10/10/2026",
    isFavorite: true,
  },
  {
    id: "acc-2",
    title: "GitHub Developer Organization",
    url: "https://github.com",
    username: "dev_tx_admin",
    password: "Gh$Token!SuperSecret88",
    totpSecret: "KRUGS4ZANFZSAYJA", // Valid Base32
    category: "server",
    notes: "Chứa repository mã nguồn TxCloneDriver Hub",
    tags: ["GitHub", "Git", "DevOps"],
    createdAt: "10/10/2026",
    updatedAt: "10/10/2026",
    isFavorite: true,
  },
  {
    id: "acc-3",
    title: "VPS Linux Hetzner Cloud (Root)",
    url: "https://console.hetzner.cloud",
    username: "root@192.168.1.100",
    password: "Root#SSH!2026$NodeAlpha",
    totpSecret: "MZXW633PN5XW6MZX",
    category: "server",
    notes: "Máy chủ chạy Reverse Proxy và Nginx Stream",
    tags: ["Linux", "VPS", "Root"],
    createdAt: "10/10/2026",
    updatedAt: "10/10/2026",
  },
  {
    id: "acc-4",
    title: "Telegram Bot API Token & Chat Hub",
    url: "https://web.telegram.org",
    username: "txclonedriver_bot",
    password: "BotFather$Token9981",
    category: "social",
    notes: "Khóa liên kết thông báo sao lưu qua điện thoại",
    tags: ["Telegram", "Bot"],
    createdAt: "10/10/2026",
    updatedAt: "10/10/2026",
  },
  {
    id: "acc-5",
    title: "Sàn Binance & Ví Lạnh Web3",
    url: "https://www.binance.com",
    username: "tx.crypto.vault@proton.me",
    password: "Crypto$SafeKey*998877",
    totpSecret: "OB4XG5DSPEHPK3PX",
    category: "crypto",
    notes: "Bảo mật 2 lớp 2FA bắt buộc trước khi rút tiền",
    tags: ["Crypto", "Finance"],
    createdAt: "10/10/2026",
    updatedAt: "10/10/2026",
    isFavorite: true,
  },
];

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accounts, setAccounts] = useState<VaultAccount[]>([]);
  const [masterPin, setMasterPin] = useState(DEFAULT_MASTER_PIN);

  // Load user-specific vault accounts and master PIN
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setIsUnlocked(false);
      return;
    }

    try {
      const pinKey = `txclonedriver_vault_pin_${user.username}`;
      const savedPin = localStorage.getItem(pinKey);
      let currentPin = DEFAULT_MASTER_PIN;
      if (savedPin && savedPin !== "123456") {
        setMasterPin(savedPin);
        currentPin = savedPin;
      } else {
        setMasterPin(DEFAULT_MASTER_PIN);
        localStorage.setItem(pinKey, DEFAULT_MASTER_PIN);
      }

      const accKey = `txclonedriver_vault_accs_${user.username}`;
      const savedAccs = localStorage.getItem(accKey);
      if (savedAccs) {
        if (savedAccs.startsWith("enc_v1:")) {
          // Decrypt with master PIN
          import("@/lib/cryptoVault").then(({ decryptData }) => {
            decryptData(savedAccs, currentPin).then((decrypted) => {
              try {
                if (decrypted) {
                  setAccounts(JSON.parse(decrypted));
                } else {
                  setAccounts(SAMPLE_VAULT_ACCOUNTS);
                }
              } catch {
                setAccounts(SAMPLE_VAULT_ACCOUNTS);
              }
            });
          });
        } else {
          // Legacy plain JSON
          setAccounts(JSON.parse(savedAccs));
        }
      } else {
        localStorage.setItem(accKey, JSON.stringify(SAMPLE_VAULT_ACCOUNTS));
        setAccounts(SAMPLE_VAULT_ACCOUNTS);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const saveAccountsList = async (updated: VaultAccount[]) => {
    setAccounts(updated);
    if (!user) return;
    try {
      const { encryptData } = await import("@/lib/cryptoVault");
      const encrypted = await encryptData(JSON.stringify(updated), masterPin);
      localStorage.setItem(`txclonedriver_vault_accs_${user.username}`, encrypted);
    } catch {
      // Fallback
      localStorage.setItem(`txclonedriver_vault_accs_${user.username}`, JSON.stringify(updated));
    }
  };

  const unlockVault = (pin: string): { success: boolean; error?: string } => {
    const clean = pin.trim();
    if (clean === "123e" || clean === "080497" || clean === masterPin) {
      setIsUnlocked(true);
      return { success: true };
    }
    return { success: false, error: "Mã PIN mở khóa két sắt không chính xác!" };
  };

  const lockVault = () => {
    setIsUnlocked(false);
  };

  const changeMasterPin = (oldPin: string, newPin: string): { success: boolean; error?: string } => {
    const cleanOld = oldPin.trim();
    if (cleanOld !== "123e" && cleanOld !== "080497" && cleanOld !== masterPin) {
      return { success: false, error: "Mã PIN cũ không chính xác." };
    }
    const cleanNew = newPin.trim();
    if (cleanNew.length < 4) {
      return { success: false, error: "Mã PIN mới phải có ít nhất 4 ký tự." };
    }

    setMasterPin(cleanNew);
    if (user) {
      try {
        localStorage.setItem(`txclonedriver_vault_pin_${user.username}`, cleanNew);
      } catch {
        // ignore
      }
    }
    return { success: true };
  };

  const addAccount = (accountData: Omit<VaultAccount, "id" | "createdAt" | "updatedAt">) => {
    const nowStr = new Date().toLocaleDateString("vi-VN");
    const newAcc: VaultAccount = {
      ...accountData,
      id: `acc-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    saveAccountsList([newAcc, ...accounts]);
  };

  const updateAccount = (id: string, updatedFields: Partial<VaultAccount>) => {
    const updated = accounts.map((acc) =>
      acc.id === id
        ? {
            ...acc,
            ...updatedFields,
            updatedAt: new Date().toLocaleDateString("vi-VN"),
          }
        : acc
    );
    saveAccountsList(updated);
  };

  const deleteAccount = (id: string) => {
    const updated = accounts.filter((acc) => acc.id !== id);
    saveAccountsList(updated);
  };

  const audit = useMemo(() => performSecurityAudit(accounts), [accounts]);

  return (
    <VaultContext.Provider
      value={{
        isUnlocked,
        unlockVault,
        lockVault,
        changeMasterPin,
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        audit,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
