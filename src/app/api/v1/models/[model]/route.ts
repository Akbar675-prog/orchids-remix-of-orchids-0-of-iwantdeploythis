import { createGuestServerClient } from "@/lib/supabase/server-guest"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"

export const maxDuration = 60

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

function generateThoughtSignature(length: number = 1200): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateResponseId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 22; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function validateApiKey(apiKey: string | null): Promise<{ valid: boolean; userId?: string }> {
  if (!apiKey) return { valid: false }
  
  const key = apiKey.replace("Bearer ", "").trim()
  if (!key.startsWith("vsk_")) return { valid: false }

  const supabase = await createGuestServerClient()
  if (!supabase) return { valid: false }

  const { data, error } = await supabase
    .from("app_api_keys")
    .select("user_id")
    .eq("key", key)
    .single()

  if (error || !data) return { valid: false }
  return { valid: true, userId: data.user_id }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  try {
    const { model } = await params
    const authHeader = request.headers.get("authorization")
    const apiKeyHeader = request.headers.get("x-api-key")
    const apiKey = authHeader || apiKeyHeader

    const { valid, userId } = await validateApiKey(apiKey)
    if (!valid) {
      return NextResponse.json(
        { error: { code: 401, message: "Invalid API key", status: "UNAUTHENTICATED" } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { contents, generationConfig } = body

    if (!contents || !Array.isArray(contents)) {
      return NextResponse.json(
        { error: { code: 400, message: "Invalid request: contents is required", status: "INVALID_ARGUMENT" } },
        { status: 400 }
      )
    }

    const messages = contents.map((c: any) => ({
      role: c.role === "model" ? "assistant" : "user",
      content: c.parts?.map((p: any) => p.text).join("") || "",
    }))

    const isThinkingModel = model.includes("gemini-3") || model.includes("thinking") || model.includes("flash")
    const modelVersion = model.replace(":generateContent", "").replace("models/", "")

    const { text, usage } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages,
      maxTokens: generationConfig?.maxOutputTokens || 2048,
      temperature: generationConfig?.temperature || 0.7,
    })

    const promptTokens = usage?.promptTokens || Math.ceil(messages.reduce((acc: number, m: any) => acc + m.content.length / 4, 0))
    const completionTokens = usage?.completionTokens || Math.ceil(text.length / 4)
    const thoughtsTokens = isThinkingModel ? Math.floor(Math.random() * 400) + 200 : 0

    const responseParts: any[] = [{ text }]

    if (isThinkingModel) {
      responseParts[0].thoughtSignature = generateThoughtSignature()
    }

    const response = {
      candidates: [
        {
          content: {
            parts: responseParts,
            role: "model",
          },
          finishReason: "STOP",
          index: 0,
        },
      ],
      usageMetadata: {
        promptTokenCount: promptTokens,
        candidatesTokenCount: completionTokens,
        totalTokenCount: promptTokens + completionTokens + thoughtsTokens,
        promptTokensDetails: [
          {
            modality: "TEXT",
            tokenCount: promptTokens,
          },
        ],
        ...(isThinkingModel && { thoughtsTokenCount: thoughtsTokens }),
      },
      modelVersion: modelVersion.includes("-preview") ? modelVersion : `${modelVersion}-preview`,
      responseId: generateResponseId(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Gemini API Error:", error)
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error", status: "INTERNAL" } },
      { status: 500 }
    )
  }
}
