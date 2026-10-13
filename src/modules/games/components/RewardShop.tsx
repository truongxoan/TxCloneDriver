"use client";

import React, { useState, useEffect } from "react";
import {
  Crown,
  Sparkles,
  ShoppingBag,
  Coins,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Award,
  Star,
  Zap,
} from "lucide-react";
import { useGames } from "../gamesContext";
import { useAuth } from "@/modules/auth/authContext";

interface ShopItem {
  id: string;
  name: string;
  desc: string;
  cost: number;
  icon: string;
  category: "badge" | "effect" | "privilege";
  color: string;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: "item_dragon_badge",
    name: "Huy Hiệu Rồng Vàng Đại Gia",
    desc: "Gắn huy hiệu Rồng Vàng phát sáng bên cạnh tên hiển thị trong toàn bộ Hub.",
    cost: 150000,
    icon: "🐉",
    category: "badge",
    color: "from-amber-500 to-yellow-300",
  },
  {
    id: "item_neon_avatar",
    name: "Khung Avatar Neon Cyberpunk",
    desc: "Khung viền avatar hiệu ứng sóng xung kích đổi 7 màu khi trò chuyện và chat chung.",
    cost: 80000,
    icon: "🌟",
    category: "effect",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "item_god_gambler",
    name: "Danh Hiệu 'Thần Bài Đại Hiệp'",
    desc: "Danh hiệu danh dự hiển thị màu đỏ ánh kim trong phòng Game & Xem chung.",
    cost: 100000,
    icon: "🃏",
    category: "badge",
    color: "from-rose-500 to-red-600",
  },
  {
    id: "item_vip_queue",
    name: "Vé Order Nhạc Ưu Tiên Hàng Đầu",
    desc: "Bài hát bạn order trong phòng Xem & Nghe Chung sẽ được nhảy lên đầu hàng đợi phát ngay lập tức.",
    cost: 50000,
    icon: "🎫",
    category: "privilege",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "item_luck_charm",
    name: "Bùa May Mắn Phong Thủy",
    desc: "Nhân đôi số Xu nhận được khi điểm danh hàng ngày trong 7 ngày kế tiếp.",
    cost: 60000,
    icon: "🏮",
    category: "privilege",
    color: "from-emerald-500 to-teal-400",
  },
  {
    id: "item_diamond_crown",
    name: "Vương Miện Kim Cương Tối Cao",
    desc: "Vật phẩm đắt giá nhất vinh danh người chơi đẳng cấp thượng lưu trên bảng vàng.",
    cost: 300000,
    icon: "👑",
    category: "badge",
    color: "from-cyan-400 to-blue-500",
  },
];

export function RewardShop() {
  const { coins, addCoins } = useGames();
  const { user } = useAuth();
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`tx_shop_items_${user?.username || "guest"}`);
      if (saved) setOwnedItems(JSON.parse(saved));
    } catch {}
  }, [user]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleBuy = (item: ShopItem) => {
    if (ownedItems.includes(item.id)) {
      triggerToast(`Bạn đã sở hữu vật phẩm "${item.name}" rồi!`);
      return;
    }
    if (coins < item.cost) {
      triggerToast(`Số dư không đủ! Bạn cần thêm ${(item.cost - coins).toLocaleString()} Xu để mua.`);
      return;
    }

    addCoins(-item.cost, `Mua vật phẩm ${item.name}`);
    const updated = [...ownedItems, item.id];
    setOwnedItems(updated);
    try {
      localStorage.setItem(`tx_shop_items_${user?.username || "guest"}`, JSON.stringify(updated));
    } catch {}

    triggerToast(`🎉 Chúc mừng! Bạn đã sở hữu "${item.name}"!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-amber-500/50 text-xs text-white flex items-center gap-3 animate-in fade-in">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Shop Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 bg-gradient-to-r from-amber-950/70 via-purple-950/50 to-slate-950/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <ShoppingBag className="w-3.5 h-3.5" /> Chợ Đổi Quà & Kinh Tế Xu
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Cửa Hàng Vật Phẩm & Danh Hiệu VIP
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Dùng Xu thắng cược từ các mini game để đổi lấy danh hiệu độc quyền và hiệu ứng tài khoản!
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center gap-2.5 shrink-0">
          <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Số dư hiện tại</span>
            <span className="text-base font-black text-amber-300 font-mono">
              {coins.toLocaleString()} Xu
            </span>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHOP_ITEMS.map((item) => {
          const isOwned = ownedItems.includes(item.id);

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl glass-panel border transition-all flex flex-col justify-between space-y-4 hover:border-white/25 ${
                isOwned
                  ? "bg-slate-900/40 border-emerald-500/30"
                  : "bg-slate-950/60 border-white/10 hover:shadow-xl"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-2xl shadow-lg`}
                  >
                    {item.icon}
                  </div>
                  {isOwned ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Đã Sở Hữu
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-black text-amber-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {item.cost.toLocaleString()} XU
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>

              <div>
                {isOwned ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold cursor-default"
                  >
                    Đã Kích Hoạt
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={coins < item.cost}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
                      coins >= item.cost
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 shadow-amber-500/20"
                        : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{coins >= item.cost ? "Đổi Quà Ngay" : "Chưa Đủ Xu"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
