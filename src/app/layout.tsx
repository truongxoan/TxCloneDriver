import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/modules/theme-engine/themeContext";
import { AuthProvider } from "@/modules/auth/authContext";
import { DriveEndpointsProvider } from "@/modules/storage/driveEndpointsContext";
import { TelegramProvider } from "@/modules/telegram/telegramContext";
import { WatchPartyProvider } from "@/modules/watch-party/watchPartyContext";
import { VaultProvider } from "@/modules/vault/vaultContext";
import { ChatProvider } from "@/modules/chat/chatContext";
import { FeedbackProvider } from "@/modules/feedback/feedbackContext";
import { MusicPlayerProvider } from "@/modules/audio/musicPlayerContext";
import { AppShell } from "@/components/layout/AppShell";

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "MêÂmĐạoSỹ — Hệ thống Quản trị & Đồng bộ Đám mây",
  description:
    "Nền tảng quản lý dữ liệu cá nhân cao cấp MêÂmĐạoSỹ tích hợp Google Drive, Telegram, Lịch âm dương Việt Nam và kiểm soát phân quyền thành viên.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TxCloneDriver",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-primary/30 selection:text-white">
        <AuthProvider>
          <DriveEndpointsProvider>
            <MusicPlayerProvider>
              <TelegramProvider>
                <WatchPartyProvider>
                  <VaultProvider>
                    <ChatProvider>
                      <FeedbackProvider>
                        <ThemeProvider>
                          <AppShell>{children}</AppShell>
                        </ThemeProvider>
                      </FeedbackProvider>
                    </ChatProvider>
                  </VaultProvider>
                </WatchPartyProvider>
              </TelegramProvider>
            </MusicPlayerProvider>
          </DriveEndpointsProvider>
        </AuthProvider>

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
