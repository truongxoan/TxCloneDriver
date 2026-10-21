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
  Bot,
  Gamepad2,
  Coins,
  Dice5,
  GraduationCap,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTelegram } from "@/modules/telegram/telegramContext";
import { cn } from "@/lib/utils";
import { ModuleGuard } from "@/components/layout/ModuleGuard";

const BOT_COMMANDS = [
  { command: "/taixiu [tai|xiu] [xu]", desc: "Bot tung xúc xắc và trao thưởng cược trong nhóm" },
  { command: "/baucua [nai|bau|ga|ca|cua|tom]", desc: "Bot lắc 3 linh vật Bầu Cua trong group" },
  { command: "/chitieutoday", desc: "Bot tóm tắt chi tiêu & hạn mức ngân sách hôm nay" },
  { command: "/dich <từ/câu>", desc: "Bot dịch thuật Trung - Việt - Anh tức thì" },
  { command: "/hsk", desc: "Bot gửi câu đố trắc nghiệm từ vựng tiếng Trung HSK" },
  { command: "/backup", desc: "Kích hoạt phiên sao lưu dữ liệu snapshot khẩn cấp" },
  { command: "/help", desc: "Xem hướng dẫn tương tác toàn bộ tính năng của Bot" },
];

interface SimMessage {
  id: string;
  sender: "user" | "bot";
  name: string;
  text: string;
  time: string;
}

export default function TelegramPage() {
  const {
    botToken,
    chatId,
    botInfo,
    isConnected,
    saveConfig,
    testConnection,
    sendTestMessage,
    sendSecurityRadarAlert,
    autoDetectChatId,
  } = useTelegram();

  const [inputToken, setInputToken] = useState(botToken);
  const [inputChatId, setInputChatId] = useState(chatId);
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingDetect, setLoadingDetect] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Bot Simulator State
  const [simInput, setSimInput] = useState("");
  const [simMessages, setSimMessages] = useState<SimMessage[]>([
    {
      id: "sim-1",
      sender: "bot",
      name: "TxCloneDriver AI Bot",
      text: "🤖 Xin chào! Tôi là Bot Telegram thông minh của TxCloneDriver Hub. Hãy gõ /help hoặc gửi lệnh /taixiu, /baucua, /chitieutoday để chơi game và giải đáp thắc mắc cùng tôi nhé!",
      time: "Vừa xong",
    },
  ]);

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
        text: res.error || "Không thể gửi tin nhắn. Hãy kiểm tra lại Bot Token và Chat ID.",
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
        text: `Đã tự động tìm thấy Chat ID của bạn: ${res.chatId}! Bấm "Lưu cấu hình" để áp dụng.`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Chưa phát hiện tin nhắn nào. Vui lòng mở Telegram và gửi 1 tin nhắn bất kỳ cho Bot trước!",
      });
    }
  };

  // Bot Simulator Responder
  const handleSendSim = (cmdText?: string) => {
    const raw = cmdText || simInput;
    if (!raw.trim()) return;

    const userText = raw.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user message
    const userMsg: SimMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      name: "Bạn",
      text: userText,
      time: timeStr,
    };

    setSimInput("");

    // Generate Bot Response
    let botReply = "";
    const lower = userText.toLowerCase();

    if (lower.startsWith("/taixiu")) {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2 + d3;
      const outcome = total >= 11 ? "TÀI" : "XỈU";
      botReply = `🎲 [KẾT QUẢ TÀI XỈU TELEGRAM]\n🎲 Xúc xắc: [${d1}] [${d2}] [${d3}] (Tổng: ${total} điểm)\n👉 Kết quả ván này: ${outcome}!\nChúc mừng anh em đã đặt cửa ${outcome} húp trọn tiền thưởng!`;
    } else if (lower.startsWith("/baucua")) {
      const animals = ["Nai 🦌", "Bầu 🎃", "Gà 🐓", "Cá 🐟", "Cua 🦀", "Tôm 🦐"];
      const a1 = animals[Math.floor(Math.random() * animals.length)];
      const a2 = animals[Math.floor(Math.random() * animals.length)];
      const a3 = animals[Math.floor(Math.random() * animals.length)];
      botReply = `🦀 [LẮC BẦU CUA TELEGRAM]\n🎉 Bát mở ra: ${a1} | ${a2} | ${a3}!\nAi đặt đúng linh vật trên nhận gấp đôi, gấp ba tiền cược!`;
    } else if (lower.startsWith("/chitieutoday")) {
      try {
        const rawExp = localStorage.getItem("txclonedriver_expenses");
        const expList = rawExp ? JSON.parse(rawExp) : [];
        const today = new Date().toISOString().split("T")[0];
        const todaySpent = expList
          .filter((i: any) => i.type === "expense" && i.date === today)
          .reduce((sum: number, i: any) => sum + i.amount, 0);
        botReply = `📊 [BÁO CÁO CHI TIÊU HÔM NAY - ${today}]\n💸 Tổng chi hôm nay: ${todaySpent.toLocaleString("vi-VN")} ₫\n💡 Trạng thái: ${
          todaySpent > 200000 ? "⚠️ Cảnh báo: Vượt hạn mức 200,000đ!" : "✅ Chi tiêu an toàn, tiết kiệm tốt!"
        }\nBạn có thể vào tab "Tính Chi Tiêu" để xem biểu đồ chi tiết.`;
      } catch {
        botReply = "📊 [BÁO CÁO CHI TIÊU]\nHôm nay bạn chưa có giao dịch chi tiêu nào được ghi nhận.";
      }
    } else if (lower.startsWith("/dich")) {
      const query = userText.replace("/dich", "").trim();
      botReply = `🌏 [TRỢ LÝ DỊCH THUẬT AI]\nNội dung: "${query || "你好"}"\n🇨🇳 Tiếng Trung: 你好，很高兴认识你！(Nǐ hǎo, hěn gāoxìng rènshí nǐ)\n🇬🇧 Tiếng Anh: Hello, nice to meet you!\n🇻🇳 Tiếng Việt: Xin chào, rất vui được làm quen với bạn!`;
    } else if (lower.startsWith("/hsk")) {
      botReply = `📚 [CÂU ĐỐ HSK HÀNG NGÀY]\n❓ Từ "准备" (zhǔnbèi) có nghĩa tiếng Việt là gì?\nA. Chuẩn bị\nB. Bắt đầu\nC. Cố gắng\nD. Hoàn thành\n👉 Hãy gõ A, B, C hoặc D để bot kiểm tra!`;
    } else if (lower === "a" || lower === "đáp án a") {
      botReply = `🎉 CHÍNH XÁC! "准备" (zhǔnbèi) nghĩa là "Chuẩn bị". Bạn nhận được +500 Xu thưởng! 🌟`;
    } else if (lower.startsWith("/help")) {
      botReply = `🤖 [DANH SÁCH LỆNH TXCLONEDRIVER BOT]\n• /taixiu: Chơi game Tài Xỉu tung xúc xắc trực tiếp\n• /baucua: Lắc 3 linh vật Bầu Cua Tôm Cá\n• /chitieutoday: Tra cứu tổng chi tiêu trong ngày\n• /dich <từ/câu>: Dịch thuật đa ngôn ngữ\n• /hsk: Câu đố trắc nghiệm tiếng Trung\n• /backup: Kích hoạt phiên sao lưu dữ liệu khẩn cấp`;
    } else {
      botReply = `🤖 Bot đã nhận tin nhắn: "${userText}". Tôi là trợ lý TxCloneDriver Bot, bạn có thể gõ /help để xem các lệnh chơi game hoặc tra cứu chi tiêu tự động!`;
    }

    const botMsg: SimMessage = {
      id: `b-${Date.now()}`,
      sender: "bot",
      name: "TxCloneDriver AI Bot",
      text: botReply,
      time: timeStr,
    };

    setSimMessages((prev) => [...prev, userMsg, botMsg]);
  };

  return (
    <ModuleGuard moduleId="telegram" moduleName="Telegram">
      <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
        {/* Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-sky-600/20 via-blue-600/20 to-cyan-600/20 glass-panel border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <Bot className="h-4 w-4" />
              <span>Telegram Bot Tự Động Hóa & Chơi Game Cùng Nhóm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bot Telegram Tự Động Trả Lời & Mini Game
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Kết nối Bot Telegram, tự động giải đáp thắc mắc, tung xúc xắc Tài Xỉu, Bầu Cua và báo cáo chi tiêu trực tiếp vào điện thoại.
            </p>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border animate-in fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/15 border-rose-500/30 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Bot Simulator & Games (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl glass-card p-6 border border-white/10 space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Khung Trò Chuyện & Chơi Game Với Bot
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Tương tác trực tiếp với AI Bot</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSendSim("/taixiu")}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1"
                >
                  <Dice5 className="w-3 h-3" />
                  <span>/taixiu</span>
                </button>
                <button
                  onClick={() => handleSendSim("/baucua")}
                  className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold"
                >
                  /baucua
                </button>
                <button
                  onClick={() => handleSendSim("/chitieutoday")}
                  className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold"
                >
                  /chitieu
                </button>
              </div>
            </div>

            {/* Chat Messages Simulator */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2 text-xs">
              {simMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[88%] ${
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isUser ? "bg-blue-600 text-white" : "bg-sky-500/20 border border-sky-400/30 text-sky-300"
                      }`}
                    >
                      {isUser ? "Bạn" : "🤖"}
                    </div>
                    <div
                      className={`p-3 rounded-2xl shadow-sm whitespace-pre-wrap leading-relaxed ${
                        isUser
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-slate-900/90 text-slate-100 border border-white/10 rounded-tl-none font-sans"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-sky-300">{msg.name}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendSim();
              }}
              className="pt-2 border-t border-white/10 flex gap-2 shrink-0"
            >
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder="Gõ lệnh /help, /taixiu, /baucua, /chitieutoday, /dich..."
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 font-mono"
              />
              <button
                type="submit"
                disabled={!simInput.trim()}
                className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white transition-all shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Bot Configuration & Commands (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Config Card */}
            <div className="rounded-3xl glass-card p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
                <Key className="h-4 w-4 text-sky-400" />
                <span>Cấu Hình Token Bot Thật</span>
              </h3>

              <form onSubmit={handleSave} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Bot Token</label>
                  <div className="flex gap-1.5">
                    <input
                      type="password"
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value)}
                      placeholder="VD: 7123456789:AAH..."
                      className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                      required
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleTestBot}
                      disabled={loadingTest || !inputToken}
                      className="text-xs h-9"
                    >
                      {loadingTest ? "Kiểm tra..." : "Test"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Chat ID của bạn</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={inputChatId}
                      onChange={(e) => setInputChatId(e.target.value)}
                      placeholder="VD: 123456789..."
                      className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                      required
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAutoDetect}
                      disabled={loadingDetect || !inputToken}
                      className="text-xs h-9 gap-1"
                    >
                      <Search className="h-3 w-3" />
                      <span>{loadingDetect ? "Quét..." : "Tìm ID"}</span>
                    </Button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/10">
                  <Button type="submit" variant="secondary" size="sm" className="text-xs">
                    Lưu cấu hình
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={loadingSend || !inputToken || !inputChatId}
                    className="gap-1 text-xs"
                  >
                    <Send className="h-3 w-3" />
                    <span>Gửi tin thật</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* Intrusion Radar Widget */}
            <div className="rounded-3xl glass-card p-5 border border-rose-500/30 bg-rose-950/20 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-rose-500/20">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-rose-400" />
                  <span>Radar An Ninh Xâm Nhập (24/7)</span>
                </h4>
                <Badge variant="danger" size="sm">Đang bảo vệ</Badge>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Tự động gửi cảnh báo khẩn cấp tới Telegram của bạn khi có ai đó nhập sai mật khẩu 3 lần liên tiếp, cố tình dò PIN két sắt hoặc truy cập trái phép.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  setStatusMessage({ type: "success", text: "Đang phát tín hiệu thử nghiệm Radar an ninh tới Telegram..." });
                  const res = await sendSecurityRadarAlert(
                    "Thử Nghiệm Radar An Ninh Thành Công",
                    "Hệ thống cảnh báo xâm nhập của bạn đang hoạt động 100% hoàn hảo."
                  );
                  if (res.success) {
                    setStatusMessage({ type: "success", text: "Tín hiệu Radar đã được gửi thành công tới Telegram của bạn!" });
                  } else {
                    setStatusMessage({ type: "error", text: res.error || "Không thể gửi cảnh báo." });
                  }
                }}
                disabled={!isConnected}
                className="w-full text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border-rose-500/30 gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Bắn Thử Nghiệm Tín Hiệu Radar An Ninh</span>
              </Button>
            </div>

            {/* Supported Commands Reference */}
            <div className="rounded-3xl glass-card p-5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-white/10">
                <Terminal className="h-4 w-4 text-sky-400" />
                <span>Danh Mục Lệnh Bot Telegram</span>
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {BOT_COMMANDS.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => handleSendSim(cmd.command.split(" ")[0])}
                  >
                    <div>
                      <span className="font-mono font-bold text-sky-300">{cmd.command}</span>
                      <p className="text-[10px] text-slate-400">{cmd.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleGuard>
  );
}
