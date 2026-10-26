"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  Clapperboard,
  FileText,
  Folder,
  HardDrive,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AnimatedCardItem = {
  title: string;
  description: string;
  href: string;
  image: string;
  icon: LucideIcon;
};

const CARDS: AnimatedCardItem[] = [
  {
    title: "Lưu trữ Drive",
    description: "Mở, tải lên và đồng bộ file Google Drive của bạn trong một nơi.",
    href: "/storage",
    image: "/images/ocean-glass.jpg",
    icon: HardDrive,
  },
  {
    title: "Dự án",
    description: "Theo dõi tiến độ, file và cộng sự của từng dự án đang chạy.",
    href: "/projects",
    image: "/images/cyber-3d.jpg",
    icon: Folder,
  },
  {
    title: "Xem chung",
    description: "Xem video cùng nhau, đồng bộ và trò chuyện theo thời gian thực.",
    href: "/watch-together",
    image: "/images/midnight-luxury.jpg",
    icon: Clapperboard,
  },
  {
    title: "Két sắt",
    description: "Lưu mật khẩu và mã 2FA trong két sắt được khóa bằng PIN.",
    href: "/vault",
    image: "/images/deep-space.jpg",
    icon: ShieldCheck,
  },
  {
    title: "Lịch",
    description: "Xem lịch, sự kiện và ngày quan trọng trong tháng của bạn.",
    href: "/calendar",
    image: "/images/spring-blossom.jpg",
    icon: Calendar,
  },
  {
    title: "Ghi chú",
    description: "Ghi nhanh ý tưởng, danh sách việc cần làm và ghi chú quan trọng.",
    href: "/notes",
    image: "/images/autumn-leaves.jpg",
    icon: FileText,
  },
];

/**
 * AnimatedCards — dãy thẻ mở rộng kiểu 3D cho đầu trang Tổng quan.
 * - Thẻ đang chọn mở rộng, các thẻ còn lại thu hẹp lại.
 * - Ảnh nền lớn phía sau đổi theo thẻ đang chọn, mờ dần.
 * - Toàn bộ khối nghiêng nhẹ theo chuột (tắt khi người dùng bật giảm chuyển động).
 * - Trên điện thoại: chạm để mở, không cần hover.
 */
export function AnimatedCards() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-7, 7]), {
    stiffness: 120,
    damping: 18,
  });

  const handleMouseMove = (event: React.MouseEvent) => {
    if (reduceMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    mouseX.set((event.clientX - rect.left) / rect.width);
    mouseY.set((event.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const activeCard = CARDS[active];

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Khám phá nhanh"
      className="relative overflow-hidden rounded-3xl border border-white/15 shadow-2xl"
      style={{ perspective: 1200 }}
    >
      {/* Ảnh nền lớn đổi theo thẻ đang chọn */}
      <AnimatePresence mode="sync">
        <motion.div
          key={activeCard.image}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeCard.image}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/55" />

      <motion.div
        style={
          reduceMotion
            ? undefined
            : { rotateX, rotateY, transformPerspective: 1000 }
        }
        className="relative p-4 sm:p-6"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Khám phá nhanh
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
              Không gian của bạn, mở ra theo cách 3D
            </h2>
          </div>
          <p className="text-xs text-white/70">
            Bấm vào một thẻ để mở rộng • Di chuột để nghiêng 3D
          </p>
        </div>

        <div className="flex h-[640px] flex-col gap-3 sm:h-[440px] sm:flex-row">
          {CARDS.map((card, index) => {
            const isActive = index === active;
            const Icon = card.icon;
            return (
              <motion.div
                key={card.href}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                aria-label={`Mở ${card.title}`}
                onClick={() => setActive(index)}
                onFocus={() => setActive(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActive(index);
                  }
                }}
                animate={{ flexGrow: isActive ? 3.2 : 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0.15 }
                    : { type: "spring", stiffness: 120, damping: 20 }
                }
                className={cn(
                  "relative min-h-[64px] cursor-pointer overflow-hidden rounded-2xl border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-white",
                  isActive
                    ? "border-white/50 shadow-2xl"
                    : "border-white/25 shadow-lg hover:border-white/40"
                )}
              >
                <motion.img
                  src={card.image}
                  alt=""
                  aria-hidden="true"
                  animate={{ scale: isActive ? 1.05 : 1.15 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className={cn(
                    "absolute inset-0",
                    isActive
                      ? "bg-gradient-to-t from-black/85 via-black/25 to-transparent"
                      : "bg-black/45"
                  )}
                />

                <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-bold text-white/90">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3
                    className={cn(
                      "font-extrabold leading-tight text-white drop-shadow",
                      isActive ? "text-lg sm:text-xl" : "text-sm"
                    )}
                  >
                    {card.title}
                  </h3>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: 8, height: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-1 text-sm text-white/85">
                          {card.description}
                        </p>
                        <Link
                          href={card.href}
                          onClick={(event) => event.stopPropagation()}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-white/90"
                        >
                          Mở ngay
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
