"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { VaultAccount, SecurityAuditResult } from "./types";
import { useAuth } from "@/modules/auth/authContext";
import { performSecurityAudit } from "./passwordGenerator";
import { encryptData, decryptData } from "@/lib/cryptoVault";

const VERIFIER_TEXT = "tx-vault-ok-v2";
const MIN_PASSWORD_LENGTH = 8;
const AUTO_LOCK_MS = 5 * 60 * 1000;
const HIDDEN_LOCK_MS = 60 * 1000;

interface VaultContextType {
  isUnlocked: boolean;
  hasVault: boolean;
  setupVault: (password: string) => Promise<{ success: boolean; error?: string }>;
  unlockVault: (password: string) => Promise<{ success: boolean; error?: string }>;
  verifyMasterPassword: (password: string) => Promise<boolean>;
  lockVault: () => void;
  changeMasterPassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  accounts: VaultAccount[];
  addAccount: (account: Omit<VaultAccount, "id" | "createdAt" | "updatedAt">) => void;
  updateAccount: (id: string, account: Partial<VaultAccount>) => void;
  deleteAccount: (id: string) => void;
  audit: SecurityAuditResult;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasVault, setHasVault] = useState(false);
  const [accounts, setAccounts] = useState<VaultAccount[]>([]);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const failedRef = useRef(0);
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hiddenRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accKey = user ? `txclonedriver_vault_accs_${user.username}` : "";
  const verifierKey = user ? `txclonedriver_vault_verifier_${user.username}` : "";

  // Clean start: only check whether a vault exists. Never decrypt or load
  // accounts before the user enters the correct vault password.
  useEffect(() => {
    setIsUnlocked(false);
    setAccounts([]);
    setMasterPassword(null);
    setFailedAttempts(0);
    failedRef.current = 0;
    if (!user) {
      setHasVault(false);
      return;
    }
    try {
      setHasVault(localStorage.getItem(verifierKey) !== null);
    } catch {
      setHasVault(false);
    }
  }, [user, verifierKey]);

  const lockVault = () => {
    setIsUnlocked(false);
    setAccounts([]);
    setMasterPassword(null);
  };

  // Auto-lock: 5 minutes without activity, or 60 seconds after the tab is hidden.
  useEffect(() => {
    if (!isUnlocked) return;
    const resetTimer = () => {
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
      inactivityRef.current = setTimeout(lockVault, AUTO_LOCK_MS);
    };
    const onHidden = () => {
      if (document.hidden) {
        if (hiddenRef.current) clearTimeout(hiddenRef.current);
        hiddenRef.current = setTimeout(lockVault, HIDDEN_LOCK_MS);
      } else if (hiddenRef.current) {
        clearTimeout(hiddenRef.current);
        hiddenRef.current = null;
      }
    };
    resetTimer();
    window.addEventListener("pointerdown", resetTimer);
    window.addEventListener("keydown", resetTimer);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
      if (hiddenRef.current) clearTimeout(hiddenRef.current);
      window.removeEventListener("pointerdown", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      document.removeEventListener("visibilitychange", onHidden);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked]);

  const saveAccountsList = async (updated: VaultAccount[], password: string | null) => {
    setAccounts(updated);
    if (!user || !password) return;
    try {
      const encrypted = await encryptData(JSON.stringify(updated), password);
      localStorage.setItem(accKey, encrypted);
    } catch {}
  };

  const setupVault = async (password: string) => {
    if (!user) return { success: false, error: "Bạn cần đăng nhập trước." };
    if (hasVault) return { success: false, error: "Két sắt đã được thiết lập, hãy mở khóa thay vì tạo mới." };
    if (password.length < MIN_PASSWORD_LENGTH) {
      return { success: false, error: "Mật khẩu khoá cần ít nhất 8 ký tự." };
    }
    try {
      // Clean start: overwrite any old vault blob, including sample data.
      localStorage.setItem(verifierKey, await encryptData(VERIFIER_TEXT, password));
      localStorage.setItem(accKey, await encryptData("[]", password));
      try { localStorage.removeItem(`txclonedriver_vault_pin_${user.username}`); } catch {}
      setHasVault(true);
      setMasterPassword(password);
      setAccounts([]);
      setIsUnlocked(true);
      return { success: true };
    } catch {
      return { success: false, error: "Không thể tạo két sắt, hãy thử lại." };
    }
  };

  const verifyMasterPassword = async (password: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const verifier = localStorage.getItem(verifierKey);
      if (!verifier) return false;
      return (await decryptData(verifier, password)) === VERIFIER_TEXT;
    } catch {
      return false;
    }
  };

  const reportFailedAttempts = (count: number) => {
    if (count < 3) return;
    try {
      const savedTg = localStorage.getItem("datavault_telegram_config");
      if (savedTg) {
        const { botToken, chatId } = JSON.parse(savedTg);
        if (botToken && chatId) {
          fetch("/api/telegram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "send_message",
              token: botToken,
              chatId,
              text: `🚨 <b>[TXCLONEDRIVER INTRUSION RADAR]</b>\n⚠️ <b>Cảnh báo:</b> Phát hiện dò mật khẩu Két Sắt sai 3 lần liên tiếp!\n👤 <b>Tài khoản đang đăng nhập:</b> @${user?.username || "Ẩn danh"}\n⏱️ <b>Thời gian:</b> <code>${new Date().toLocaleString("vi-VN")}</code>`,
            }),
          }).catch(() => {});
        }
      }
    } catch {}
  };

  const unlockVault = async (password: string) => {
    if (!user) return { success: false, error: "Bạn cần đăng nhập trước." };
    if (!hasVault) return { success: false, error: "Chưa có két sắt. Hãy tạo mật khẩu khoá mới." };
    const ok = await verifyMasterPassword(password);
    if (!ok) {
      const next = failedRef.current + 1;
      failedRef.current = next;
      setFailedAttempts(next);
      reportFailedAttempts(next);
      return { success: false, error: "Mật khẩu khoá không chính xác!" };
    }
    failedRef.current = 0;
    setFailedAttempts(0);
    try {
      const saved = localStorage.getItem(accKey);
      if (saved && saved.startsWith("enc_v1:")) {
        const decrypted = await decryptData(saved, password);
        setAccounts(decrypted ? JSON.parse(decrypted) : []);
      } else {
        // Legacy plaintext blobs are not trusted in the clean vault.
        setAccounts([]);
      }
    } catch {
      setAccounts([]);
    }
    setMasterPassword(password);
    setIsUnlocked(true);
    return { success: true };
  };

  const changeMasterPassword = async (oldPassword: string, newPassword: string) => {
    if (!isUnlocked || !masterPassword) return { success: false, error: "Hãy mở khóa két sắt trước." };
    if (!(await verifyMasterPassword(oldPassword))) {
      return { success: false, error: "Mật khẩu khoá cũ không chính xác." };
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return { success: false, error: "Mật khẩu khoá mới cần ít nhất 8 ký tự." };
    }
    try {
      localStorage.setItem(verifierKey, await encryptData(VERIFIER_TEXT, newPassword));
      await saveAccountsList(accounts, newPassword);
      setMasterPassword(newPassword);
      return { success: true };
    } catch {
      return { success: false, error: "Không thể đổi mật khẩu khoá, hãy thử lại." };
    }
  };

  const addAccount = (accountData: Omit<VaultAccount, "id" | "createdAt" | "updatedAt">) => {
    if (!isUnlocked || !masterPassword) return;
    const nowStr = new Date().toLocaleDateString("vi-VN");
    const newAcc: VaultAccount = { ...accountData, id: `acc-${Date.now()}`, createdAt: nowStr, updatedAt: nowStr };
    saveAccountsList([newAcc, ...accounts], masterPassword);
  };

  const updateAccount = (id: string, updatedFields: Partial<VaultAccount>) => {
    if (!isUnlocked || !masterPassword) return;
    const updated = accounts.map((acc) => (acc.id === id ? { ...acc, ...updatedFields, updatedAt: new Date().toLocaleDateString("vi-VN") } : acc));
    saveAccountsList(updated, masterPassword);
  };

  const deleteAccount = (id: string) => {
    if (!isUnlocked || !masterPassword) return;
    saveAccountsList(accounts.filter((acc) => acc.id !== id), masterPassword);
  };

  const audit = useMemo(() => performSecurityAudit(accounts), [accounts]);

  return (
    <VaultContext.Provider value={{ isUnlocked, hasVault, setupVault, unlockVault, verifyMasterPassword, lockVault, changeMasterPassword, accounts, addAccount, updateAccount, deleteAccount, audit }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault must be used within a VaultProvider");
  return context;
}
