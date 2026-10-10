import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/modules/theme-engine/themeContext";
import { AuthProvider } from "@/modules/auth/authContext";
import { DriveEndpointsProvider } from "@/modules/storage/driveEndpointsContext";
import { TelegramProvider } from "@/modules/telegram/telegramContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "TxCloneDriver — Hệ thống Quản trị & Đồng bộ Đám mây",
  description:
    "Nền tảng quản lý dữ liệu cá nhân cao cấp TxCloneDriver tích hợp Google Drive, Telegram, Lịch âm dương Việt Nam và kiểm soát phân quyền thành viên.",
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
          <DriveEndpointsProvider>
            <TelegramProvider>
              <ThemeProvider>
                <AppShell>{children}</AppShell>
              </ThemeProvider>
            </TelegramProvider>
          </DriveEndpointsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
