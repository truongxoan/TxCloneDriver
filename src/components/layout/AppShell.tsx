"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SeasonalCanvas } from "@/modules/seasonal-effects/SeasonalCanvas";
import { QuickSearchModal } from "./QuickSearchModal";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-foreground flex overflow-hidden">
      {/* Layer 0: Scenic Fullscreen Wallpaper */}
      {currentTheme.bgImage ? (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out transform scale-100"
          style={{ backgroundImage: `url('${currentTheme.bgImage}')` }}
        >
          {/* Subtle dark vignette overlay for readability */}
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-950 via-zinc-950 to-black" />
      )}

      {/* Layer 1: Seasonal Particle Canvas */}
      <SeasonalCanvas />

      {/* Layer 2: Main Layout UI */}
      <div className="relative z-10 flex w-full min-h-screen">
        {/* Left Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Content Wrapper */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300",
            collapsed ? "md:pl-[72px]" : "md:pl-[240px]"
          )}
        >
          {/* Top Multi-Pill Smart Header */}
          <Header
            onOpenMobileMenu={() => setMobileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
          />

          {/* Main Workspace Body */}
          <main className="flex-1 p-3.5 sm:p-5 lg:p-6 w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Global Quick Search Ctrl+K Modal */}
      <QuickSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
