"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit3,
  RefreshCw,
  Sparkles,
  Zap,
  Globe,
  Mail,
  Server,
  Building2,
  Coins,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sliders,
  Gamepad2,
  GraduationCap,
  ShoppingBag,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { useVault } from "@/modules/vault/vaultContext";
import { useAuth } from "@/modules/auth/authContext";
import { VaultAccount, VaultCategory } from "@/modules/vault/types";
import { calculateTotp, generateRandomTotpSecret } from "@/modules/vault/totp";
import {
  generatePassword,
  evaluatePasswordStrength,
} from "@/modules/vault/passwordGenerator";

export default function VaultPage() {
  const { user } = useAuth();
  const {
    isUnlocked,
    hasVault,
    setupVault,
    unlockVault,
    verifyMasterPassword,
    lockVault,
    changeMasterPassword,
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    audit,
  } = useVault();

  // Unlock PIN form state
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [setupConfirm, setSetupConfirm] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [pendingSensitive, setPendingSensitive] = useState<{ id: string; action: "show" | "copy"; password: string } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<VaultCategory>("all");

  // Show/Hide password toggle per account
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // 2FA TOTP live countdown ticker (ticks every 1s)
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<VaultAccount | null>(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Add/Edit Form State
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formTotpSecret, setFormTotpSecret] = useState("");
  const [formCategory, setFormCategory] = useState<VaultCategory>("email");
  const [formNotes, setFormNotes] = useState("");

  // Password Generator Modal State
  const [genLength, setGenLength] = useState(16);
  const [genUpper, setGenUpper] = useState(true);
  const [genLower, setGenLower] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Change PIN State
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinModalError, setPinModalError] = useState<string | null>(null);

  // Generate initial password for modal
  useEffect(() => {
    setGeneratedPassword(
      generatePassword({
        length: genLength,
        useUpper: genUpper,
        useLower: genLower,
        useNumbers: genNumbers,
        useSymbols: genSymbols,
        excludeAmbiguous: true,
      })
    );
  }, [genLength, genUpper, genLower, genNumbers, genSymbols]);

  const handleRegenPassword = () => {
    setGeneratedPassword(
      generatePassword({
        length: genLength,
        useUpper: genUpper,
        useLower: genLower,
        useNumbers: genNumbers,
        useSymbols: genSymbols,
        excludeAmbiguous: true,
      })
    );
  };

  // Handle Unlock submission
  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    const res = await unlockVault(pinInput);
    if (res.success) {
      setPinInput("");
    } else {
      setPinError(res.error || "Mật khẩu khoá không đúng.");
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (pinInput !== setupConfirm) {
      setPinError("Mật khẩu khoá nhập lại chưa khớp.");
      return;
    }
    const res = await setupVault(pinInput);
    if (res.success) {
      setPinInput("");
      setSetupConfirm("");
    } else {
      setPinError(res.error || "Không thể tạo két sắt.");
    }
  };

  // Open modal for new account
  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setFormTitle("");
    setFormUrl("");
    setFormUsername("");
    setFormPassword(
      generatePassword({
        length: 16,
        useUpper: true,
        useLower: true,
        useNumbers: true,
        useSymbols: true,
        excludeAmbiguous: true,
      })
    );
    setFormTotpSecret("");
    setFormCategory("email");
    setFormNotes("");
    setShowAddModal(true);
  };

  // Open modal for editing existing account
  const handleOpenEditModal = (acc: VaultAccount) => {
    setEditingAccount(acc);
    setFormTitle(acc.title);
    setFormUrl(acc.url);
    setFormUsername(acc.username);
    setFormPassword(acc.password);
    setFormTotpSecret(acc.totpSecret || "");
    setFormCategory(acc.category);
    setFormNotes(acc.notes || "");
    setShowAddModal(true);
  };

  // Submit Add or Edit
  const handleSaveAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUsername.trim() || !formPassword.trim()) {
      triggerToast("Vui lòng điền đủ Tên dịch vụ, Tên đăng nhập và Mật khẩu.");
      return;
    }

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        title: formTitle.trim(),
        url: formUrl.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        totpSecret: formTotpSecret.trim() || undefined,
        category: formCategory,
        notes: formNotes.trim() || undefined,
      });
      triggerToast(`Đã cập nhật tài khoản "${formTitle}"!`);
    } else {
      addAccount({
        title: formTitle.trim(),
        url: formUrl.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        totpSecret: formTotpSecret.trim() || undefined,
        category: formCategory,
        notes: formNotes.trim() || undefined,
        tags: [formCategory],
      });
      triggerToast(`Đã lưu tài khoản "${formTitle}" vào két sắt!`);
    }

    setShowAddModal(false);
  };

  // Submit Change PIN
  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinModalError(null);
    const res = await changeMasterPassword(oldPin, newPin);
    if (res.success) {
      triggerToast("Đã đổi mã PIN mở két sắt thành công!");
      setOldPin("");
      setNewPin("");
      setShowPinModal(false);
    } else {
      setPinModalError(res.error || "Không thể đổi mã PIN.");
    }
  };

  // A password is only shown or copied after re-entering the vault password.
  const requestSensitiveAction = (acc: VaultAccount, action: "show" | "copy") => {
    if (visiblePasswords[acc.id] && action === "show") {
      setVisiblePasswords((prev) => ({ ...prev, [acc.id]: false }));
      return;
    }
    setPendingSensitive({ id: acc.id, action, password: acc.password });
    setVerifyInput("");
    setVerifyError(null);
    setShowVerifyModal(true);
  };

  const handleVerifySensitive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingSensitive) return;
    const ok = await verifyMasterPassword(verifyInput);
    if (!ok) {
      setVerifyError("Mật khẩu khoá không đúng, không thể hiện hoặc sao chép mật khẩu này.");
      return;
    }
    if (pendingSensitive.action === "show") {
      setVisiblePasswords((prev) => ({ ...prev, [pendingSensitive.id]: true }));
      setTimeout(() => setVisiblePasswords((prev) => ({ ...prev, [pendingSensitive.id]: false })), 15000);
    } else {
      navigator.clipboard.writeText(pendingSensitive.password);
      triggerToast("Đã sao chép Mật khẩu vào Clipboard!");
    }
    setShowVerifyModal(false);
    setPendingSensitive(null);
    setVerifyInput("");
  };

  // Copy with security feedback
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Đã sao chép ${label} vào Clipboard!`);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchCat = selectedCategory === "all" || acc.category === selectedCategory;
    const matchSearch =
      acc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.notes && acc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const getCategoryIcon = (cat: VaultCategory) => {
    switch (cat) {
      case "email":
        return <Mail className="h-4 w-4 text-sky-400" />;
      case "social":
        return <Globe className="h-4 w-4 text-pink-400" />;
      case "server":
        return <Server className="h-4 w-4 text-emerald-400" />;
      case "banking":
        return <Building2 className="h-4 w-4 text-amber-400" />;
      case "crypto":
        return <Coins className="h-4 w-4 text-yellow-400" />;
      case "work":
        return <Briefcase className="h-4 w-4 text-indigo-400" />;
      case "game":
        return <Gamepad2 className="h-4 w-4 text-fuchsia-400" />;
      case "study":
        return <GraduationCap className="h-4 w-4 text-teal-400" />;
      case "shopping":
        return <ShoppingBag className="h-4 w-4 text-orange-400" />;
      default:
        return <KeyRound className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <ModuleGuard moduleId="vault" moduleName="Két Sắt Mật Khẩu & 2FA">
      <div className="space-y-6 pb-24">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-primary/50 text-xs text-foreground flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW A: VAULT IS LOCKED (ENTER MASTER PIN) */}
        {/* ============================================================== */}
        {!isUnlocked ? (
          <div className="min-h-[65vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 bg-slate-950/85 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
              {/* Vault Door Icon */}
              <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-xl shadow-blue-600/30 flex items-center justify-center">
                <div className="h-full w-full rounded-3xl bg-slate-950/50 flex items-center justify-center">
                  <Lock className="h-10 w-10 text-white animate-pulse" />
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-sky-400/30">
                  <KeyRound className="h-3 w-3" />
                  Mã Hóa Riêng Tư Cấp Độ Quân Sự
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
                  Két Sắt Mật Khẩu & Mã 2FA
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Vault mới, sạch và trống. Dữ liệu chỉ được giải mã khi bạn nhập đúng mật khẩu khoá, và sẽ tự khóa lại sau 5 phút không dùng. Tài khoản của @{user?.username} không có tài khoản mẫu.
                </p>
              </div>

              {/* Pin Error */}
              {pinError && (
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Setup (first time) or Unlock */}
              <form onSubmit={hasVault ? handleUnlockSubmit : handleSetupSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder={hasVault ? "Nhập mật khẩu khoá..." : "Tạo mật khẩu khoá (ít nhất 8 ký tự)..."}
                    className="w-full text-center text-lg font-bold py-3 rounded-2xl glass-input text-white font-mono placeholder:text-slate-600 placeholder:text-xs"
                    autoFocus
                    required
                  />
                  {!hasVault && (
                    <input
                      type="password"
                      value={setupConfirm}
                      onChange={(e) => setSetupConfirm(e.target.value)}
                      placeholder="Nhập lại mật khẩu khoá..."
                      className="w-full text-center text-lg font-bold py-3 rounded-2xl glass-input text-white font-mono placeholder:text-slate-600 placeholder:text-xs"
                      required
                    />
                  )}
                  <p className="text-[11px] text-slate-400">
                    {hasVault
                      ? "Nhập đúng mật khẩu khoá (dạng chữ, không phải mã PIN số) mới xem được mục tài khoản."
                      : "Đây là Vault mới sạch, chưa có tài khoản mẫu. Mật khẩu khoá là mật khẩu dạng chữ, ít nhất 8 ký tự — chỉ bạn biết, quên là không khôi phục được."}
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-xs font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Unlock className="h-4 w-4" />
                  <span>{hasVault ? "Mở Khóa Két Sắt Ngay" : "Tạo Két Sắt Mới"}</span>
                </Button>
              </form>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* VIEW B: VAULT IS UNLOCKED (MAIN DASHBOARD & ACCOUNTS) */
          /* ============================================================== */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Vault Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-white/15 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      Két Sắt Mật Khẩu & Xác Thực 2FA
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      Đang Mở Khóa
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Chủ sở hữu: <strong className="text-sky-300">@{user?.username}</strong> &bull; Quản lý {accounts.length} tài khoản & mã OTP trực tiếp
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowGenModal(true)}
                  className="h-8 text-xs gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-400/20"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Tạo Mật Khẩu</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPinModal(true)}
                  className="h-8 text-xs gap-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Đổi mật khẩu khoá</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddModal}
                  className="h-8 text-xs gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm tài khoản</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={lockVault}
                  className="h-8 text-xs gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  title="Khóa két sắt ngay lập tức"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Khóa Két</span>
                </Button>
              </div>
            </div>

            {/* Security Health & Audit Summary (3 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Health Score Card */}
              <Card className="p-4 bg-slate-900/50 border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Điểm An Ninh Tổng Thể</span>
                  <span className="text-xs font-black text-emerald-400">{audit.healthScore}/100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      audit.healthScore > 80
                        ? "bg-emerald-500"
                        : audit.healthScore > 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${audit.healthScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {audit.healthScore >= 80
                    ? "🛡️ Mức độ an toàn cao. Đạt chuẩn bảo mật."
                    : "⚠️ Khuyến nghị bật thêm 2FA và tăng độ dài mật khẩu."}
                </p>
              </Card>

              {/* 2FA Stats Card */}
              <Card className="p-4 bg-slate-900/50 border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Xác Thực 2 Lớp (2FA)</span>
                  <Badge variant="success" size="sm">
                    {audit.withTotpCount}/{audit.totalAccounts} đã bật
                  </Badge>
                </div>
                <p className="text-xl font-black text-sky-400 pt-1">
                  {Math.round((audit.withTotpCount / (audit.totalAccounts || 1)) * 100)}%
                </p>
                <p className="text-[11px] text-slate-400">
                  Tương thích hoàn toàn Google / Microsoft Authenticator.
                </p>
              </Card>

              {/* Risk Audit Card */}
              <Card className="p-4 bg-slate-900/50 border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Cảnh Báo Rủi Ro</span>
                  <Badge variant={audit.weakPasswordCount > 0 ? "warning" : "default"} size="sm">
                    {audit.weakPasswordCount} mật khẩu yếu
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 pt-1">
                  Mật khẩu trùng lặp: <strong className="text-amber-400">{audit.reusedPasswordCount}</strong> tài khoản
                </p>
                <p className="text-[11px] text-slate-400">
                  Nên sử dụng mật khẩu riêng biệt cho từng website.
                </p>
              </Card>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="space-y-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "all", label: "Tất cả", icon: Layers },
                  { id: "email", label: "Email", icon: Mail },
                  { id: "social", label: "Mạng xã hội", icon: Globe },
                  { id: "server", label: "Server & Dev", icon: Server },
                  { id: "banking", label: "Ngân hàng", icon: Building2 },
                  { id: "crypto", label: "Crypto & Web3", icon: Coins },
                  { id: "work", label: "Công việc", icon: Briefcase },
                  { id: "game", label: "Game", icon: Gamepad2 },
                  { id: "study", label: "Học tập", icon: GraduationCap },
                  { id: "shopping", label: "Mua sắm", icon: ShoppingBag },
                  { id: "other", label: "Khác", icon: KeyRound },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  const count =
                    cat.id === "all"
                      ? accounts.length
                      : accounts.filter((a) => a.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as VaultCategory)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                        isActive
                          ? "bg-blue-600 text-white font-bold shadow-sm"
                          : "bg-surface-elevated text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Keyword Search Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm tài khoản theo tên dịch vụ, username, URL..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs text-white"
                />
              </div>
            </div>

            {/* Accounts Grid (Cards) */}
            {filteredAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAccounts.map((acc) => {
                  const isPassVisible = visiblePasswords[acc.id] || false;
                  const strength = evaluatePasswordStrength(acc.password);

                  // Calculate live 2FA code if account has totpSecret
                  const totp = acc.totpSecret ? calculateTotp(acc.totpSecret) : null;

                  return (
                    <Card
                      key={acc.id}
                      className="p-5 bg-slate-900/60 border-white/10 space-y-4 hover:border-white/25 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Header: Icon, Title, Category */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-9 w-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                              {getCategoryIcon(acc.category)}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-white text-sm truncate" title={acc.title}>
                                {acc.title}
                              </h3>
                              {acc.url && (
                                <a
                                  href={acc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 truncate"
                                >
                                  <span className="truncate">{acc.url.replace(/^https?:\/\//, "")}</span>
                                  <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                </a>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 uppercase shrink-0">
                            {acc.category}
                          </span>
                        </div>

                        {/* Username Row */}
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-500 block">Tên đăng nhập / Email</span>
                            <span className="text-xs font-mono font-bold text-white truncate block">
                              {acc.username}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyText(acc.username, "Tên đăng nhập")}
                            className="text-slate-400 hover:text-white p-1 transition-colors"
                            title="Sao chép tên đăng nhập"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Password Row */}
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Mật khẩu</span>
                            <span className={`text-[10px] font-semibold ${strength.color}`}>
                              Độ mạnh: {strength.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-white truncate">
                              {isPassVisible ? acc.password : "••••••••••••••••"}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => requestSensitiveAction(acc, "show")}
                                className="text-slate-400 hover:text-white p-1"
                                title={isPassVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                              >
                                {isPassVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => requestSensitiveAction(acc, "copy")}
                                className="text-slate-400 hover:text-white p-1"
                                title="Sao chép mật khẩu"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* LIVE 2FA TOTP AUTHENTICATOR WIDGET */}
                        {totp && (
                          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/50 to-indigo-950/40 border border-sky-400/30 space-y-2 shadow-inner">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                                <KeyRound className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                                Mã Xác Thực 2FA (TOTP)
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                Đổi sau <strong className="text-white">{totp.secondsRemaining}s</strong>
                              </span>
                            </div>

                            {/* 6-Digit Code & Copy */}
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-mono font-black tracking-widest text-white drop-shadow-sm">
                                {totp.code.slice(0, 3)} {totp.code.slice(3)}
                              </span>

                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCopyText(totp.code, "Mã 2FA OTP")}
                                className="h-7 text-xs px-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-sky-200 border border-sky-400/30 gap-1"
                              >
                                <Copy className="h-3 w-3" />
                                <span>Copy 2FA</span>
                              </Button>
                            </div>

                            {/* Progress Countdown Bar */}
                            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-1000 linear"
                                style={{ width: `${totp.percentRemaining}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {acc.notes && (
                          <p className="text-[11px] text-slate-400 italic line-clamp-2">
                            {acc.notes}
                          </p>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-500">
                        <span>Cập nhật: {acc.updatedAt}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(acc)}
                            className="text-slate-400 hover:text-white p-1 transition-colors"
                            title="Chỉnh sửa tài khoản"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa tài khoản "${acc.title}" khỏi két sắt không?`)) {
                                deleteAccount(acc.id);
                                triggerToast(`Đã xóa tài khoản "${acc.title}"`);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center space-y-3">
                <KeyRound className="h-10 w-10 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">Không tìm thấy tài khoản nào khớp với tìm kiếm.</p>
                <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
                  + Thêm tài khoản mới
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: ADD / EDIT ACCOUNT */}
        {/* ============================================================== */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl glass-panel p-6 border border-white/20 bg-slate-950/95 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {editingAccount ? "Chỉnh Sửa Tài Khoản" : "Thêm Tài Khoản Vào Két Sắt"}
                  </h3>
                  <p className="text-[11px] text-slate-400">Lưu trữ mật khẩu và thiết lập mã xác thực 2FA</p>
                </div>
              </div>

              <form onSubmit={handleSaveAccountSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Tên dịch vụ / Ứng dụng
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ví dụ: Google Cloud, Facebook, Binance..."
                    className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Đường dẫn Website / Đăng nhập
                  </label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Tên đăng nhập / Email
                    </label>
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="Email hoặc username..."
                      className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200 block">Danh mục</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as VaultCategory)}
                      className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white bg-slate-900"
                    >
                      <option value="email">Email</option>
                      <option value="social">Mạng xã hội</option>
                      <option value="server">Server & Dev</option>
                      <option value="banking">Ngân hàng</option>
                      <option value="crypto">Crypto & Web3</option>
                      <option value="work">Công việc</option>
                      <option value="game">Game</option>
                      <option value="study">Học tập</option>
                      <option value="shopping">Mua sắm</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Password field with quick generate */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">Mật khẩu</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormPassword(
                          generatePassword({
                            length: 16,
                            useUpper: true,
                            useLower: true,
                            useNumbers: true,
                            useSymbols: true,
                            excludeAmbiguous: true,
                          })
                        )
                      }
                      className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      Tạo mật khẩu mạnh
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white font-mono"
                    required
                  />
                </div>

                {/* 2FA Secret Key */}
                <div className="space-y-1 p-3 rounded-2xl bg-blue-950/30 border border-sky-400/20">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-sky-300">
                      Khóa bí mật 2FA Authenticator (Base32)
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormTotpSecret(generateRandomTotpSecret())}
                      className="text-[11px] text-sky-400 hover:underline"
                    >
                      Tạo key thử nghiệm
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formTotpSecret}
                    onChange={(e) => setFormTotpSecret(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: JBSWY3DPEHPK3PXP..."
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white font-mono uppercase"
                  />
                  <p className="text-[10px] text-slate-400">
                    💡 Nhập mã Secret do Google/GitHub/Facebook cung cấp khi bật 2FA để tự động sinh mã OTP 6 số đếm ngược trực tiếp!
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">Ghi chú bảo mật</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Mã dự phòng, câu hỏi bảo mật..."
                    className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white h-16"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    {editingAccount ? "Lưu thay đổi" : "Lưu vào két sắt"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: PASSWORD GENERATOR DIALOG */}
        {/* ============================================================== */}
        {showGenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 bg-slate-950/95 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Trình Tạo Mật Khẩu Nâng Cao</h3>
                  <p className="text-[11px] text-slate-400">Sinh chuỗi ngẫu nhiên chuẩn an toàn</p>
                </div>
              </div>

              {/* Password Result Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-mono font-bold text-sky-300 break-all select-all">
                    {generatedPassword}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={handleRegenPassword}
                      className="text-slate-400 hover:text-white p-1"
                      title="Sinh mật khẩu mới"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopyText(generatedPassword, "Mật khẩu mới")}
                      className="text-slate-400 hover:text-white p-1"
                      title="Sao chép"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                  <span className="text-slate-400">
                    Độ mạnh: <strong className="text-emerald-400">Cực kỳ an toàn</strong>
                  </span>
                  <span className="text-slate-400">
                    Thời gian bẻ khóa: <strong className="text-white">&gt; 500 triệu năm</strong>
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Độ dài mật khẩu: <strong className="text-white font-mono">{genLength} ký tự</strong></span>
                  <input
                    type="range"
                    min={8}
                    max={40}
                    value={genLength}
                    onChange={(e) => setGenLength(parseInt(e.target.value, 10))}
                    className="w-32 accent-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={genUpper}
                      onChange={(e) => setGenUpper(e.target.checked)}
                      className="rounded border-white/20 bg-slate-900 text-blue-600"
                    />
                    <span>Chữ hoa (A-Z)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={genLower}
                      onChange={(e) => setGenLower(e.target.checked)}
                      className="rounded border-white/20 bg-slate-900 text-blue-600"
                    />
                    <span>Chữ thường (a-z)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={genNumbers}
                      onChange={(e) => setGenNumbers(e.target.checked)}
                      className="rounded border-white/20 bg-slate-900 text-blue-600"
                    />
                    <span>Chữ số (0-9)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={genSymbols}
                      onChange={(e) => setGenSymbols(e.target.checked)}
                      className="rounded border-white/20 bg-slate-900 text-blue-600"
                    />
                    <span>Ký tự đặc biệt (!@#$)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <Button variant="secondary" size="sm" onClick={() => setShowGenModal(false)}>
                  Đóng
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleCopyText(generatedPassword, "Mật khẩu");
                    setShowGenModal(false);
                  }}
                >
                  Sao chép & Đóng
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: CHANGE MASTER PIN */}
        {/* Re-enter vault password to show or copy one password */}
        {showVerifyModal && pendingSensitive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl glass-panel p-6 border border-white/20 bg-slate-950/95 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Nhập lại mật khẩu khoá</h3>
                  <p className="text-[11px] text-slate-400">Chỉ khi nhập đúng, mật khẩu này mới được {pendingSensitive.action === "show" ? "hiện ra" : "sao chép"} và sẽ tự ẩn sau 15 giây.</p>
                </div>
              </div>
              {verifyError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">{verifyError}</div>
              )}
              <form onSubmit={handleVerifySensitive} className="space-y-3">
                <input type="password" value={verifyInput} onChange={(e) => setVerifyInput(e.target.value)} placeholder="Mật khẩu khoá..." className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white" required autoFocus />
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <Button variant="secondary" size="sm" onClick={() => { setShowVerifyModal(false); setPendingSensitive(null); }}>Hủy</Button>
                  <Button type="submit" variant="primary" size="sm">Xác nhận</Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ============================================================== */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl glass-panel p-6 border border-white/20 bg-slate-950/95 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Đổi Mật Khẩu Khoá</h3>
                  <p className="text-[11px] text-slate-400">Thay đổi mã mở khóa cho tài khoản @{user?.username}</p>
                </div>
              </div>

              {pinModalError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {pinModalError}
                </div>
              )}

              <form onSubmit={handleChangePinSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">Mật khẩu khoá hiện tại</label>
                  <input
                    type="password"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value)}
                    placeholder="Mật khẩu khoá hiện tại..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">Mật khẩu khoá mới</label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Mật khẩu khoá mới (ít nhất 8 ký tự)..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <Button variant="secondary" size="sm" onClick={() => setShowPinModal(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Lưu mật khẩu khoá mới
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ModuleGuard>
  );
}
