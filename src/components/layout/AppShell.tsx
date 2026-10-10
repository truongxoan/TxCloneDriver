"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SeasonalCanvas } from "@/modules/seasonal-effects/SeasonalCanvas";
import { QuickSearchModal } from "./QuickSearchModal";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background text-foreground flex">
      {/* Background Seasonal Canvas (Layer 0) */}
      <SeasonalCanvas />

      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10",
          collapsed ? "md:pl-[72px]" : "md:pl-[240px]"
        )}
      >
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Quick Search Ctrl+K Modal */}
      <QuickSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
