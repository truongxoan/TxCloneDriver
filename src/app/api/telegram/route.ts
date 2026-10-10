import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, token, chatId, text } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp TELEGRAM_BOT_TOKEN." },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();

    // 1. Action: Test bot token
    if (action === "test_bot") {
      const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
      const data = await res.json();

      if (!data.ok) {
        return NextResponse.json(
          {
            success: false,
            error: data.description || "Token Bot Telegram không hợp lệ.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        bot: {
          id: data.result.id,
          name: data.result.first_name,
          username: data.result.username,
        },
      });
    }

    // 2. Action: Send live message to Telegram chat
    if (action === "send_message") {
      if (!chatId) {
        return NextResponse.json(
          { success: false, error: "Vui lòng cung cấp TELEGRAM_CHAT_ID." },
          { status: 400 }
        );
      }

      const res = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: text || "🔔 [TxCloneDriver Cloud Hub] Thông báo thử nghiệm kết nối thành công!",
          parse_mode: "HTML",
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        return NextResponse.json(
          {
            success: false,
            error: data.description || "Không thể gửi tin nhắn tới Chat ID này.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        messageId: data.result.message_id,
      });
    }

    // 3. Action: Get updates (find chat ID automatically if user chatted with bot)
    if (action === "get_updates") {
      const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getUpdates`);
      const data = await res.json();

      if (!data.ok) {
        return NextResponse.json(
          { success: false, error: data.description },
          { status: 400 }
        );
      }

      const updates = data.result || [];
      const chats: { id: number; name: string; username?: string; text?: string }[] = [];

      updates.forEach((u: { message?: { chat: { id: number; first_name?: string; username?: string }; text?: string } }) => {
        if (u.message?.chat) {
          chats.push({
            id: u.message.chat.id,
            name: u.message.chat.first_name || "User",
            username: u.message.chat.username,
            text: u.message.text,
          });
        }
      });

      return NextResponse.json({ success: true, chats });
    }

    return NextResponse.json(
      { success: false, error: "Hành động không hợp lệ." },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi kết nối tới Telegram API.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
