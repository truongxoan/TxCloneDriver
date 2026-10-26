"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { useAuth } from "@/modules/auth/authContext";
import { Trophy, Plus, Minus, Crown, Medal, UserCheck } from "lucide-react";

export function LeaderboardWidget() {
  const { managedUsers, isAdmin, adjustUserCoins } = useAuth();
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [deltaAmount, setDeltaAmount] = useState<string>("10000");

  // Audit fix #12: pending members are NOT ranked, and the 50,000
  // default is never presented as a real score. managedUsers seeds every
  // account (including the pending one) with coins: 50000, so a raw sort
  // made all 4 members look tied at exactly 50,000. Only approved members
  // are ranked, by their stored coins value; a missing coins value shows
  // as a dash, not as the default. Pending members are listed separately,
  // labelled "Chờ duyệt", with no score.
  const approvedUsers = managedUsers.filter((u) => u.status !== "pending");
  const pendingUsers = managedUsers.filter((u) => u.status === "pending");
  const sortedUsers = [...approvedUsers].sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0));

  const handleAdjust = (isAdd: boolean) => {
    if (!selectedUser) return;
    const val = parseInt(deltaAmount, 10);
    if (isNaN(val) || val <= 0) return;
    adjustUserCoins(selectedUser.id, isAdd ? val : -val);
    setSelectedUser(null);
  };

  return (
    <div className="rounded-3xl glass-card p-5 border border-white/10 shadow-glass flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Bảng Điểm Số Top Thành Viên
            </h3>
            <p className="text-[10px] text-muted-foreground">Xếp hạng ví điểm cược giải trí</p>
          </div>
        </div>

        {isAdmin && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Admin +/- Điểm
          </span>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
        {sortedUsers.map((u, idx) => {
          return (
            <div
              key={u.id}
              className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                idx === 0
                  ? "bg-amber-500/10 border-amber-500/30"
                  : idx === 1
                  ? "bg-slate-400/10 border-slate-400/20"
                  : idx === 2
                  ? "bg-amber-700/10 border-amber-700/20"
                  : "bg-black/20 border-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div className="w-6 h-6 flex items-center justify-center font-black text-xs shrink-0">
                  {idx === 0 ? (
                    <span className="text-lg">🥇</span>
                  ) : idx === 1 ? (
                    <span className="text-lg">🥈</span>
                  ) : idx === 2 ? (
                    <span className="text-lg">🥉</span>
                  ) : (
                    <span className="text-muted-foreground font-mono">#{idx + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    u.avatarInitials || u.username.slice(0, 2).toUpperCase()
                  )}
                </div>

                {/* Name & Bio */}
                <div className="truncate">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span className="truncate">{u.name}</span>
                    {u.role === "admin" && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {u.bio || `@${u.username}`}
                  </div>
                </div>
              </div>

              {/* Coins & Admin Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black text-amber-400 font-mono">
                  {u.coins == null ? "—" : `${u.coins.toLocaleString()} đ`}
                </span>

                {isAdmin && (
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-0.5"
                    title="Cộng / Trừ điểm"
                  >
                    +/- Điểm
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending members: listed, never ranked, and never given the
          default 50,000 as a score (audit fix #12). */}
      {pendingUsers.length > 0 && (
        <div className="shrink-0 pt-2 border-t border-white/10 space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Chờ duyệt — chưa xếp hạng
          </p>
          {pendingUsers.map((u) => (
            <div
              key={u.id}
              className="p-2.5 rounded-2xl border border-white/5 bg-black/20 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    u.avatarInitials || u.username.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{u.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">@{u.username}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                Chờ duyệt
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Admin Adjust Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 border border-white/15 space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-white">
              Điều Chỉnh Điểm Cho: <span className="text-amber-400">{selectedUser.name}</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Hiện tại đang có: <strong>{selectedUser.coins == null ? "—" : selectedUser.coins.toLocaleString()}</strong> điểm.
            </p>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Số điểm muốn thay đổi:
              </label>
              <input
                type="number"
                value={deltaAmount}
                onChange={(e) => setDeltaAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleAdjust(true)}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" /> Cộng Thêm
              </button>
              <button
                onClick={() => handleAdjust(false)}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow"
              >
                <Minus className="w-3.5 h-3.5" /> Trừ Bớt
              </button>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white"
            >
              Hủy Bỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
