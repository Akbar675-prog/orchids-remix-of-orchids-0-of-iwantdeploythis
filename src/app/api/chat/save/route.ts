import { NextResponse } from "next/server"
import { logUserMessage, storeAssistantMessage, validateAndTrackUsage } from "../api"
import type { Message } from "@/app/types/api.types"

export async function POST(req: Request) {
  try {
    const { 
      chatId, 
      userId, 
      role, 
      content, 
      model, 
      isAuthenticated, 
      message_group_id,
      attachments
    } = await req.json()

    if (!chatId || !userId || !role || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await validateAndTrackUsage({
      userId,
      model: model || "unknown",
      isAuthenticated: !!isAuthenticated,
    })

    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (role === "user") {
      await logUserMessage({
        supabase,
        chatId,
        userId,
        content,
        attachments: attachments || [],
        message_group_id,
      })
    } else if (role === "assistant") {
      await storeAssistantMessage({
        supabase,
        chatId,
        userId,
        messages: [{
          role: "assistant",
          content: content,
        }] as Message[],
        message_group_id,
        model: model || "unknown",
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error saving message:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
