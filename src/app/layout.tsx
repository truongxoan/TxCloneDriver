import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/modules/theme-engine/themeContext";
import { AuthProvider } from "@/modules/auth/authContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "DataVault Cloud Hub — Premium Data Management Platform",
  description:
    "Nền tảng quản lý dữ liệu cá nhân cao cấp tích hợp Google Drive, Telegram, Lịch âm dương Việt Nam và giao diện 3D theo mùa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-primary/30 selection:text-white">
        <AuthProvider>
          <ThemeProvider>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
