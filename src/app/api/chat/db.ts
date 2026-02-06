import type { ContentPart, Message } from "@/app/types/api.types"
import type { Database, Json } from "@/app/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

const DEFAULT_STEP = 0

export async function saveFinalAssistantMessage(
  supabase: SupabaseClient<Database>,
  chatId: string,
  messages: Message[],
  message_group_id?: string,
  model?: string,
  userId?: string
) {
  const parts: ContentPart[] = []
  const toolMap = new Map<string, ContentPart>()
  const textParts: string[] = []

  for (const message of messages) {
    if (typeof message.content === "string") {
      textParts.push(message.content)
      parts.push({ type: "text", text: message.content })
    } else if (Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === "text") {
          textParts.push(part.text)
          parts.push(part)
        } else if (part.type === "tool-call") {
          const key = `${part.toolCallId}-${part.toolName}`
          toolMap.set(key, part)
          parts.push(part)
        } else if (part.type === "tool-result") {
          parts.push(part)
        }
      }
    }
  }

  const finalPlainText = textParts.join("\n\n")

  const { error } = await supabase.from("messages").insert({
    chat_id: chatId,
    user_id: userId,
    role: "assistant",
    content: finalPlainText || "",
    parts: parts as unknown as Json,
    message_group_id,
    model,
  })

  if (error) {
    console.error("Error saving final assistant message:", error)
    throw new Error(`Failed to save assistant message: ${error.message}`)
  } else {
    console.log("Assistant message saved successfully (merged).")
  }
}
