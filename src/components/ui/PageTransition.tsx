"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * PageTransition — hiệu ứng chuyển trang dùng chung cho giai đoạn 1.
 * Mỗi khi đổi route, nội dung chính mờ dần + trượt nhẹ lên + phóng to
 * rất nhẹ từ 0.99 về 1, tạo cảm giác có chiều sâu mà không làm chậm
 * điều hướng. Tôn trọng prefers-reduced-motion.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div key={pathname}>{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "top center" }}
    >
      {children}
    </motion.div>
  );
}
