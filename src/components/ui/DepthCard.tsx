"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface DepthCardProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
  > {
  /** Độ nghiêng tối đa theo độ, mặc định 8. Đặt 0 để tắt nghiêng. */
  tilt?: number;
  /** Bật/tắt lớp bóng sáng di theo chuột. */
  glare?: boolean;
}

/**
 * DepthCard — thẻ 3D dùng chung cho giai đoạn 1 của bản làm lại.
 * - Nghiêng theo chuột với perspective 1000, có lò xo làm mềm chuyển động.
 * - Lớp con có class `tx-depth-child` sẽ được đẩy nổi lên theo trục Z.
 * - Tôn trọng prefers-reduced-motion: không nghiêng, không bóng sáng.
 * - Không thay đổi logic bên trong, chỉ bọc giao diện nên dùng được cho
 *   mọi module hiện có mà không cần sửa lại dữ liệu hay quyền.
 */
export function DepthCard({
  tilt = 8,
  glare = true,
  className,
  children,
  ...props
}: DepthCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [tilt, -tilt]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-tilt, tilt]), {
    stiffness: 150,
    damping: 20,
  });
  const glareX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [0, 1], ["0%", "100%"]);
  const glareBackground = useMotionTemplate`radial-gradient(240px circle at ${glareX} ${glareY}, rgba(255,255,255,0.14), transparent 70%)`;

  const handleMouseMove = (event: React.MouseEvent) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    mouseX.set((event.clientX - rect.left) / rect.width);
    mouseY.set((event.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        reduceMotion || tilt === 0
          ? undefined
          : { rotateX, rotateY, transformPerspective: 1000 }
      }
      className={cn(
        "tx-depth relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {glare && !reduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{ background: glareBackground }}
        />
      )}
      <div className="relative z-10 [transform-style:preserve-3d]">
        {children}
      </div>
    </motion.div>
  );
}
