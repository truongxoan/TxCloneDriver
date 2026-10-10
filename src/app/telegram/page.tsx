"use client";

import React, { useState } from "react";
import {
  Send,
  Terminal,
  Users,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Key,
  MessageSquare,
  Sparkles,
  Zap,
  Check,
  RotateCw,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTelegram } from "@/modules/telegram/telegramContext";
import { cn } from "@/lib/utils";
import { ModuleGuard } from "@/components/layout/ModuleGuard";

const BOT_COMMANDS = [
  { command: "/start", desc: "Khởi động bot và xác thực danh tính người dùng" },
  { command: "/help", desc: "Xem danh sách các lệnh và cú pháp sử dụng" },
  { command: "/status", desc: "Kiểm tra tình trạng tài nguyên, CPU, RAM và sao lưu" },
  { command: "/search <từ khóa>", desc: "Tìm kiếm tài liệu và tệp tin trên Google Drive" },
  { command: "/recent", desc: "Xem các tệp tin cập nhật gần đây nhất" },
  { command: "/backup", desc: "Kích hoạt phiên sao lưu snapshot thủ công khẩn cấp" },
  { command: "/cancel", desc: "Hủy bỏ tác vụ đang chờ xác nhận" },
];

export default function TelegramPage() {
  const {
    botToken,
    chatId,
    botInfo,
    isConnected,
    saveConfig,
    testConnection,
    sendTestMessage,
    autoDetectChatId,
    disconnect,
  } = useTelegram();

  const [inputToken, setInputToken] = useState(botToken);
  const [inputChatId, setInputChatId] = useState(chatId);
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingDetect, setLoadingDetect] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(inputToken, inputChatId);
    setStatusMessage({ type: "success", text: "Đã lưu cấu hình Bot Telegram thành công!" });
  };

  const handleTestBot = async () => {
    setLoadingTest(true);
    setStatusMessage(null);
    const res = await testConnection(inputToken);
    setLoadingTest(false);
    if (res.success && res.bot) {
      saveConfig(inputToken, inputChatId);
      setStatusMessage({
        type: "success",
        text: `Kết nối thành công tới Bot: ${res.bot.name} (@${res.bot.username})!`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Token Bot không chính xác. Vui lòng kiểm tra lại.",
      });
    }
  };

  const handleSendMessage = async () => {
    setLoadingSend(true);
    setStatusMessage(null);
    const res = await sendTestMessage();
    setLoadingSend(false);
    if (res.success) {
      setStatusMessage({
        type: "success",
        text: "Đã gửi tin nhắn thử nghiệm thành công! Hãy kiểm tra ứng dụng Telegram trên điện thoại/máy tính của bạn.",
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Không thể gửi tin nhắn. Hãy kiểm tra Chat ID hoặc chắc chắn bạn đã bấm 'Start' trong chat với Bot.",
      });
    }
  };

  const handleAutoDetect = async () => {
    setLoadingDetect(true);
    setStatusMessage(null);
    const res = await autoDetectChatId();
    setLoadingDetect(false);
    if (res.success && res.chatId) {
      setInputChatId(res.chatId);
      setStatusMessage({
        type: "success",
        text: `Đã tự động tìm thấy Chat ID của bạn: ${res.chatId}!`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Chưa tìm thấy tin nhắn nào. Hãy mở Telegram gửi 1 tin nhắn cho Bot rồi bấm lại nút này!",
      });
    }
  };

  return (
    <ModuleGuard moduleId="telegram" moduleName="Telegram Bot">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Send className="h-6 w-6 text-sky-400" />
            Telegram Control Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cấu hình Bot Telegram, kết nối thông báo thời gian thực và quản lý lệnh tương tác
          </p>
        </div>

        <Badge
          variant={isConnected ? "success" : "outline"}
          size="md"
          className="flex items-center gap-1.5"
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
            )}
          />
          <span>{isConnected ? `Đã kết nối: @${botInfo?.username}` : "Chưa kết nối Bot"}</span>
        </Badge>
      </div>

      {/* Live Status Message */}
      {statusMessage && (
        <div
          className={cn(
            "p-4 rounded-2xl border text-xs flex items-center gap-3 animate-in fade-in",
            statusMessage.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          )}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Bot Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cấu hình Bot Telegram</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Nhập Bot Token từ @BotFather và Chat ID của bạn
                  </p>
                </div>
              </div>

              {isConnected && (
                <button
                  onClick={disconnect}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Ngắt kết nối
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Token Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  1. Telegram Bot Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="VD: 7123456789:AAFlkBq7_Z9Y1xAbCdEf..."
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
                    required
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleTestBot}
                    disabled={loadingTest || !inputToken.trim()}
                    className="gap-1.5 text-xs shrink-0"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>{loadingTest ? "Đang kiểm tra..." : "Kiểm tra Token"}</span>
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Lấy miễn phí bằng cách chat với <strong className="text-sky-300">@BotFather</strong> trên Telegram và gõ lệnh <code>/newbot</code>.
                </p>
              </div>

              {/* Chat ID Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  2. Telegram Chat ID (Nơi nhận tin nhắn)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: 123456789 (Dãy số ID tài khoản hoặc nhóm)"
                    value={inputChatId}
                    onChange={(e) => setInputChatId(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAutoDetect}
                    disabled={loadingDetect || !inputToken.trim()}
                    className="gap-1.5 text-xs shrink-0"
                    title="Tự động tìm Chat ID từ tin nhắn gần nhất bạn gửi cho bot"
                  >
                    <Search className="h-3.5 w-3.5 text-sky-400" />
                    <span>{loadingDetect ? "Đang quét..." : "Tự tìm ID"}</span>
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Gửi 1 tin nhắn bất kỳ cho bot của bạn trên Telegram, sau đó bấm <strong>&ldquo;Tự tìm ID&rdquo;</strong> để hệ thống tự điền ID! Hoặc chat với <code>@userinfobot</code> để lấy số ID.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                <Button type="submit" variant="secondary" size="sm" className="text-xs">
                  Lưu cấu hình
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={loadingSend || !inputToken || !inputChatId}
                  className="gap-1.5 text-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{loadingSend ? "Đang gửi..." : "Gửi tin nhắn thử nghiệm"}</span>
                </Button>
              </div>
            </form>
          </Card>

          {/* Bot Commands Reference */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="h-4 w-4 text-sky-400" />
                Các Lệnh Tương Tác Hỗ Trợ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              {BOT_COMMANDS.map((cmd, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-sky-300">{cmd.command}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cmd.desc}</p>
                  </div>
                  <Badge variant="outline" size="sm" className="text-[9px]">
                    Hoạt động
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Bot Info Card & Features (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {botInfo?.name || "TxCloneDriver Cloud Bot"}
                </h3>
                <p className="text-xs text-sky-400 font-mono">
                  {botInfo?.username ? `@${botInfo.username}` : "@Chưa kết nối"}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-300">Trạng thái kết nối</span>
                <span className="font-bold text-emerald-400">
                  {isConnected ? "Hoạt động (Online)" : "Chưa cấu hình"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-300">Chat ID đích</span>
                <span className="font-mono text-white">{chatId || "Chưa có"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-300">Giao thức API</span>
                <span className="text-slate-300">Telegram Bot API (HTTPS)</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-[11px] text-sky-300 space-y-1">
              <p className="font-bold">✨ Tự động hóa kết nối:</p>
              <p className="text-slate-300">
                Khi cấu hình xong, hệ thống TxCloneDriver sẽ tự động gửi thông báo khi hoàn thành sao lưu hoặc cảnh báo thời tiết bất thường trực tiếp vào điện thoại của bạn!
              </p>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </ModuleGuard>
  );
}
