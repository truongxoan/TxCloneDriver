"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HolographicTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareEffect?: boolean;
}

export function HolographicTiltCard({
  children,
  className,
  maxTilt = 10,
  glareEffect = true,
  ...props
}: HolographicTiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transformStyle, setTransformStyle] = useState("");
  const [glareStyle, setGlareStyle] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
    );

    if (glareEffect) {
      setGlareStyle({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.35,
      });
    }
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: "transform 0.15s ease-out, box-shadow 0.2s ease",
      }}
      className={cn("relative overflow-hidden transition-all duration-200", className)}
      {...props}
    >
      {children}

      {/* Dynamic Holographic Glare Reflection */}
      {glareEffect && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 250px at ${glareStyle.x}% ${glareStyle.y}%, rgba(255,255,255,0.2), transparent 70%)`,
            opacity: glareStyle.opacity,
          }}
        />
      )}
    </div>
  );
}
