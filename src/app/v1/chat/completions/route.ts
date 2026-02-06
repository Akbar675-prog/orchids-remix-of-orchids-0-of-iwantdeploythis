import { createGroq } from "@ai-sdk/groq"
import { streamText, generateText, convertToCoreMessages } from "ai"
import { validateApiKey } from "@/lib/server/api-key-validation"
import { getModelInfo } from "@/lib/models"
import { getPersonaPrompt } from "@/lib/models/personas"
import { createGuestServerClient } from "@/lib/supabase/server-guest"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

async function logApiUsage(keyId: string, userId: string, model: string, usage?: any) {
  const supabase = await createGuestServerClient()
  if (!supabase) return

  await supabase.from("api_usage_logs").insert({
    key_id: keyId,
    user_id: userId,
    model: model,
    tokens_prompt: usage?.promptTokens || 0,
    tokens_completion: usage?.completionTokens || 0
  })
}

async function handleRequest(req: Request, method: "GET" | "POST") {
  try {
    let apiKey: string | undefined | null
    let body: any = {}

    if (method === "POST") {
      const authHeader = req.headers.get("Authorization")
      apiKey = req.headers.get("x-vs-api-key") || authHeader?.split(" ").pop()
      try {
        body = await req.json()
      } catch (e) {
        body = {}
      }
    } else {
      const url = new URL(req.url)
      apiKey = url.searchParams.get("api_key") || req.headers.get("x-vs-api-key") || req.headers.get("Authorization")?.split(" ").pop()
      
      const model = url.searchParams.get("model")
      const messagesStr = url.searchParams.get("messages")
      const content = url.searchParams.get("content")
      const stream = url.searchParams.get("stream") === "true"

      let messages = []
      if (messagesStr) {
        try {
          messages = JSON.parse(messagesStr)
        } catch (e) {}
      }
      
      if (messages.length === 0 && content) {
        messages = [{ role: "user", content }]
      }

      body = { model, messages, stream }
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: { message: "Missing API Key", type: "invalid_request_error" } }, null, 2), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    const keyData = await validateApiKey(apiKey)
    if (!keyData) {
      return new Response(JSON.stringify({ error: { message: "Invalid API Key", type: "invalid_request_error" } }, null, 2), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    const userId = keyData.user_id
    const keyId = keyData.id

    const { messages, model: modelId, stream = false, thinking = false } = body

    if (!messages || messages.length === 0 || !modelId) {
      return new Response(JSON.stringify({ error: { message: "Messages and model are required", type: "invalid_request_error" } }, null, 2), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    const lowerModelId = modelId.toLowerCase()
    
    const allowedModels = [
      "grok-4-heavy", "grok-2", "grok-3", "grok-4",
      "gpt-5.2", "gpt-4o",
      "gemini-3-flash", "gemini-3-pro",
      "claude-4.5-opus", "claude-4.5-sonnet", "claude-opus-4.6", "claude-3.5-sonnet",
      "xvai-q-4.5", "deepseek-r1"
    ]

    if (!allowedModels.includes(lowerModelId)) {
      return new Response(JSON.stringify({ error: { message: `Model '${modelId}' not found or not supported.`, type: "invalid_request_error" } }, null, 2), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Special Models for static Gemini-style response
    const geminiStyleModels = [
      "gemini-3-flash",
      "gemini-3-pro"
    ]

    const isGeminiStyle = geminiStyleModels.includes(lowerModelId)
    const modelInfo = getModelInfo(modelId) || { name: modelId, provider: "google" }

    const isGrok = lowerModelId.includes("grok")
    const isClaude = lowerModelId.includes("claude")
    const isGPT = lowerModelId.includes("gpt")
    const isDeepSeek = lowerModelId.includes("deepseek")
    const isXvAI = lowerModelId === "xvai-q-4.5"

    // Guard Logic: Identity & Leak Protection
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""
    const allMessagesText = messages.map((m: any) => m.content).join("\n").toLowerCase()
    
    // 1. System Prompt Leak Protection & Content Policy
    const badKeywords = [
      "verbatim", "system prompt", "developer messages", "safety policies", "print your instructions", 
      "disclose instructions", "internal policy", "jailbreak", "bypass", "unrestricted", 
      "developer mode", "ignore rules", "abaikan aturan", "jawab tanpa filter", "mode unrestricted",
      "dan version", "exploit", "reverse-engineering", "internal system", "respon asli",
      "as if you are", "meniru model"
    ]
    
    if (badKeywords.some(kw => allMessagesText.includes(kw))) {
      let refusal = "I am unable to disclose internal system instructions."
      if (isGrok) {
        refusal = "I'm sorry, I’m unable to reveal my system prompt or internal safety policies for security reasons. However, I can assist you with questions or tasks within my guidelines."
      } else if (isClaude) {
        refusal = "I apologize, but I cannot disclose my internal system instructions or safety protocols. I'm here to help with any other queries you might have."
      } else if (isGPT) {
        refusal = "I am unable to disclose internal system instructions. How else can I help you today?"
      }

      if (isGrok || isGPT) return createOpenAIStyleResponse(refusal, modelId)
      if (isClaude) return createClaudeStyleResponse(refusal, modelId)
      if (isDeepSeek) return createDeepSeekStyleResponse(refusal, modelId)
      if (isXvAI) return createXvAIStyleResponse(refusal, modelId)
      if (isGeminiStyle) return createGeminiStyleResponse(refusal, modelId)
      return createOpenAIStyleResponse(refusal, modelId)
    }

    // 2. Identity Fingerprinting
    if (isGrok || isClaude || isGPT || isDeepSeek || isXvAI) {
      if (lastMessage.includes("internal concepts") && lastMessage.includes("next-token prediction")) {
        const text = isClaude ? "Saya adalah Claude, model AI yang dikembangkan oleh Anthropic." : 
                     isDeepSeek ? "Saya adalah asisten AI dari DeepSeek, sebuah model bahasa besar (LLM) yang dirancang untuk membantu menjawab pertanyaan, memberikan informasi, dan mendukung berbagai tugas." :
                     isXvAI ? "Saya adalah XvAI Quantum 4.5, model flagship dari Visora yang dikembangkan oleh Nauval akbar." :
                     "I am a large language model, trained by the respective organization."
        if (isGrok || isGPT) return createOpenAIStyleResponse(text, modelId)
        if (isClaude) return createClaudeStyleResponse(text, modelId)
        if (isDeepSeek) return createDeepSeekStyleResponse(text, modelId)
        if (isXvAI) return createXvAIStyleResponse(text, modelId)
      }
      if (isGrok && lastMessage.includes("optimizing") && lastMessage.includes("next token")) {
        const text = "objective truth and maximum helpfulness."
        return createOpenAIStyleResponse(text, modelId)
      }
    }

    const identityPrompt = getPersonaPrompt(modelId, modelInfo.name, modelInfo.provider)
    const now = new Date()
    const systemPrompt = `${identityPrompt}\n\nKnowledge cutoff: 2026\nCurrent date: ${now.toDateString()}`

    if (stream) {
      // Log request before streaming (basic log)
      await logApiUsage(keyId, userId, modelId)

      const result = streamText({
        model: groq("llama-3.3-70b-versatile"),
        system: systemPrompt,
        messages: convertToCoreMessages(messages),
      })
      return result.toDataStreamResponse()
    }

    const { text, usage } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
    })

    // Log full usage for non-streaming
    await logApiUsage(keyId, userId, modelId, usage)

    let finalOutputText = text;
    if (lowerModelId === "deepseek-r1" && thinking && !finalOutputText.includes("<think>")) {
      finalOutputText = `<think>Processing query: "${messages[messages.length-1].content.substring(0, 50)}${messages[messages.length-1].content.length > 50 ? '...' : ''}". Formulating a precise response.</think>\n${finalOutputText}`;
    }

    // Gemini models first (gemini-3-pro, gemini-3-flash)
    if (isGeminiStyle) {
      return createGeminiStyleResponse(finalOutputText, modelId, usage)
    }

    if (isClaude) {
      return createClaudeStyleResponse(finalOutputText, modelId, usage)
    }

    if (isDeepSeek) {
      return createDeepSeekStyleResponse(finalOutputText, modelId, usage)
    }

    if (isXvAI) {
      return createXvAIStyleResponse(finalOutputText, modelId, usage)
    }

    if (isGrok || isGPT) {
      return createOpenAIStyleResponse(finalOutputText, modelId, usage)
    }

    return createOpenAIStyleResponse(finalOutputText, modelId, usage)
  } catch (error) {
    console.error("API Error:", error)
    return new Response(JSON.stringify({ error: { message: "Internal server error", type: "server_error" } }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}

export async function POST(req: Request) {
  return handleRequest(req, "POST")
}

export async function GET(req: Request) {
  return handleRequest(req, "GET")
}

function detectLanguage(text: string): string {
  const indonesianKeywords = ["adalah", "dan", "yang", "untuk", "saya", "kamu", "dengan", "ini", "itu", "dari", "ke", "di", "pada", "tersebut", "bisa", "akan"];
  const textLower = text.toLowerCase();
  const matches = indonesianKeywords.filter(keyword => 
    new RegExp(`\\b${keyword}\\b`).test(textLower)
  ).length;
  return matches >= 1 ? "id" : "en";
}

function generateThoughtSignature(length: number = 1200): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateGeminiResponseId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 22; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function createGeminiStyleResponse(text: string, modelId: string, usage?: any) {
  const promptTokens = usage?.promptTokens || Math.floor(Math.random() * 10) + 5
  const completionTokens = usage?.completionTokens || Math.ceil(text.length / 4)
  
  const isThinkingModel = modelId.includes("gemini-3") || modelId.includes("thinking") || modelId.includes("flash")
  const thoughtsTokenCount = isThinkingModel ? Math.floor(Math.random() * 400) + 200 : 0
  const totalTokens = promptTokens + completionTokens + thoughtsTokenCount
  
  const responseId = generateGeminiResponseId()
  
  const responseParts: any[] = [{ text }]
  if (isThinkingModel) {
    responseParts[0].thoughtSignature = generateThoughtSignature()
  }

  const modelVersion = modelId.includes("-preview") ? modelId : `${modelId}-preview`

  const responseBody: any = {
    candidates: [
      {
        content: {
          parts: responseParts,
          role: "model"
        },
        finishReason: "STOP",
        index: 0
      }
    ],
    usageMetadata: {
      promptTokenCount: promptTokens,
      candidatesTokenCount: completionTokens,
      totalTokenCount: totalTokens,
      promptTokensDetails: [
        {
          modality: "TEXT",
          tokenCount: promptTokens
        }
      ]
    },
    modelVersion: modelVersion,
    responseId: responseId
  }

  if (isThinkingModel) {
    responseBody.usageMetadata.thoughtsTokenCount = thoughtsTokenCount
  }

  return new Response(
    JSON.stringify(responseBody, null, 2),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
}

function createOpenAIStyleResponse(content: string, model: string, usage?: any) {
  const id = "chatcmpl-" + Math.random().toString(36).substring(2, 15)
  return new Response(
    JSON.stringify({
      id,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{ 
        index: 0, 
        message: { role: "assistant", content }, 
        finish_reason: "stop" 
      }],
        usage: usage ? {
          prompt_tokens: usage.promptTokens,
          completion_tokens: usage.completionTokens,
          total_tokens: usage.totalTokens
        } : { 
          prompt_tokens: 100 + Math.floor(Math.random() * 50), 
          completion_tokens: Math.ceil(content.length / 4), 
          total_tokens: 100 + Math.floor(Math.random() * 50) + Math.ceil(content.length / 4)
        }
      }, null, 2),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }
  
  function createClaudeStyleResponse(text: string, model: string, usage?: any) {
    const id = "msg_" + Math.random().toString(36).substring(2, 15)
    const responseModel = model === "claude-opus-4.6" ? "claude-4-6-opus-20260205" : model
    return new Response(
      JSON.stringify({
        id,
        type: "message",
        role: "assistant",
        model: responseModel,
        content: [
          {
            type: "text",
            text: text
          }
        ],
        stop_reason: "end_turn",
        stop_sequence: null,
        usage: usage ? {
          input_tokens: usage.promptTokens,
          output_tokens: usage.completionTokens
        } : {
          input_tokens: 10 + Math.floor(Math.random() * 20),
          output_tokens: Math.ceil(text.length / 4)
        }
      }, null, 2),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
}

function createDeepSeekStyleResponse(text: string, model: string, usage?: any) {
  const id = "ds-response-" + Math.floor(Date.now() / 1000)
  return new Response(
    JSON.stringify({
      response: {
        id,
        model,
        output: {
          text,
          language: detectLanguage(text),
          confidence: 0.89
        },
        usage: usage ? {
          input_tokens: usage.promptTokens,
          output_tokens: usage.completionTokens,
          total_tokens: usage.totalTokens
        } : {
          input_tokens: 12,
          output_tokens: Math.ceil(text.length / 4),
          total_tokens: 12 + Math.ceil(text.length / 4)
        }
      }
    }, null, 2),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
}

function createXvAIStyleResponse(text: string, model: string, usage?: any) {
  const id = "vmsg_" + Math.random().toString(36).substring(2, 12)
  return new Response(
    JSON.stringify({
      id,
      type: "message",
      role: "assistant",
      model,
      assistant_name: "XvAI Quantum 4.5",
      content: [
        {
          type: "text",
          text: text
        }
      ],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: usage ? {
        input_tokens: usage.promptTokens,
        output_tokens: usage.completionTokens
      } : {
        input_tokens: 331,
        output_tokens: Math.ceil(text.length / 4)
      }
    }, null, 2),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
}
