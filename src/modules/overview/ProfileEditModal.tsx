"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { useAuth } from "@/modules/auth/authContext";
import { User, Check, X, Shield, Crown, Sparkles, Image, CheckCircle2 } from "lucide-react";

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ open, onClose }: ProfileEditModalProps) {
  const { user, isAdmin, updateProfile, managedUsers, approveNameChange, rejectNameChange } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [notice, setNotice] = useState<string | null>(null);

  if (!open) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateProfile(name, avatarUrl.trim() || undefined, bio.trim() || undefined);
    setNotice(res.message);
    if (!res.requiresApproval) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const pendingUsers = managedUsers.filter((u) => u.pendingNameChange);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-6 border border-white/15 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Chỉnh Sửa Hồ Sơ Cá Nhân
                {isAdmin && <Crown className="w-4 h-4 text-amber-400" />}
              </h3>
              <p className="text-xs text-muted-foreground">Tùy biến tên hiển thị, ảnh đại diện và tiểu sử</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {notice && (
          <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            {notice}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/20 flex items-center justify-center text-lg font-bold text-white overflow-hidden shrink-0 shadow-lg">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.avatarInitials || "TX"
              )}
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-muted-foreground block">
                Link ảnh Avatar (URL hình ảnh):
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/my-avatar.jpg"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[11px] text-muted-foreground font-semibold block mb-1.5">
              Hoặc chọn avatar có sẵn:
            </span>
            <div className="flex gap-2">
              {[
                "/images/cat-mascot.jpg",
                "/images/cyber-3d.jpg",
                "/images/spring-blossom.jpg",
                "/images/summer-nature.jpg",
                "/images/autumn-leaves.jpg",
                "/images/winter-crystal.jpg",
              ].map((imgUrl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setAvatarUrl(imgUrl)}
                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                    avatarUrl === imgUrl ? "border-blue-400 scale-105" : "border-white/10 hover:border-white/40"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted-foreground">Tên hiển thị:</label>
              {!isAdmin && (
                <span className="text-[10px] text-amber-400 font-bold">
                  (Cần Admin duyệt khi đổi tên)
                </span>
              )}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên hiển thị mới..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          {/* Custom Bio */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Tiểu sử / Bio cá nhân:
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Viết một dòng giới thiệu ngắn về bản thân..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-blue-500/30"
            >
              Lưu Hồ Sơ
            </button>
          </div>
        </form>

        {/* ADMIN ONLY: PENDING NAME CHANGE REQUESTS TO APPROVE */}
        {isAdmin && pendingUsers.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-amber-300 uppercase">
                Yêu Cầu Đổi Tên Chờ Admin Duyệt ({pendingUsers.length})
              </h4>
            </div>

            <div className="space-y-2">
              {pendingUsers.map((pu) => (
                <div
                  key={pu.id}
                  className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">@{pu.username}</span> muốn đổi tên từ{" "}
                    <span className="line-through text-muted-foreground">{pu.name}</span> &rarr;{" "}
                    <strong className="text-amber-400 font-black">{pu.pendingNameChange}</strong>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => approveNameChange(pu.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                    >
                      <Check className="w-3 h-3" /> Duyệt
                    </button>
                    <button
                      onClick={() => rejectNameChange(pu.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                    >
                      <X className="w-3 h-3" /> Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
