import { validateApiKey } from "@/lib/server/api-key-validation"

const models = [
  {
    name: "grok-4-heavy",
    version: "001",
    displayName: "Grok 4 Heavy",
    description: "Very cheap model made by xAI. High-performance reasoning at low cost, supports massive context for complex tasks, released in early 2026.",
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedGenerationMethods: ["generateContent", "countTokens", "createCachedContent", "batchGenerateContent"],
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxTemperature: 2,
    thinking: true
  },
  {
    name: "grok-2",
    version: "1.0",
    displayName: "Grok 2",
    description: "Advanced language model by xAI with balanced speed and performance.",
    inputTokenLimit: 131072,
    outputTokenLimit: 4096,
    supportedGenerationMethods: ["generateContent"],
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxTemperature: 1.5,
    thinking: false
  },
  {
    name: "grok-3",
    version: "1.0",
    displayName: "Grok 3",
    description: "Next-generation model from xAI with improved reasoning and knowledge.",
    inputTokenLimit: 262144,
    outputTokenLimit: 8192,
    supportedGenerationMethods: ["generateContent"],
    temperature: 0.8,
    topP: 0.95,
    topK: 50,
    maxTemperature: 1.8,
    thinking: true
  },
  {
    name: "grok-4",
    version: "1.0",
    displayName: "Grok 4",
    description: "State-of-the-art model from xAI, pushing the boundaries of AI capabilities.",
    inputTokenLimit: 524288,
    outputTokenLimit: 16384,
    supportedGenerationMethods: ["generateContent"],
    temperature: 0.9,
    topP: 0.95,
    topK: 60,
    maxTemperature: 2,
    thinking: true
  },
  {
    name: "gpt-5.2",
    version: "001",
    displayName: "GPT 5.2",
    description: "OpenAI's most advanced model with unprecedented intelligence and versatility.",
    inputTokenLimit: 1048576,
    outputTokenLimit: 32768,
    supportedGenerationMethods: ["generateContent", "countTokens"],
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxTemperature: 2,
    thinking: true
  },
  {
    name: "gpt-4o",
    version: "latest",
    displayName: "GPT 4o",
    description: "OpenAI's high-speed multimodal model optimized for real-time applications.",
    inputTokenLimit: 128000,
    outputTokenLimit: 4096,
    supportedGenerationMethods: ["generateContent"],
    temperature: 0.7,
    topP: 1,
    topK: 1,
    maxTemperature: 2,
    thinking: false
  },
  {
    name: "gemini-3-flash",
    version: "001",
    displayName: "Gemini 3 Flash",
    description: "Google's fastest model with high efficiency and large context window.",
    inputTokenLimit: 1048576,
    outputTokenLimit: 8192,
    supportedGenerationMethods: ["generateContent"],
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxTemperature: 2,
    thinking: false
  },
  {
    name: "gemini-3-pro",
    version: "001",
    displayName: "Gemini 3 Pro",
    description: "Google's most capable model for complex reasoning and multimodal tasks.",
    inputTokenLimit: 2097152,
    outputTokenLimit: 32768,
    supportedGenerationMethods: ["generateContent"],
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxTemperature: 2,
    thinking: true
  },
  {
    name: "claude-4.5-opus",
    version: "1.0",
    displayName: "Claude 4.5 Opus",
    description: "Anthropic's most powerful model for highly complex tasks and nuance.",
    inputTokenLimit: 200000,
    outputTokenLimit: 4096,
    supportedGenerationMethods: ["generateContent"],
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxTemperature: 2,
    thinking: true
  },
    {
      name: "claude-4.5-sonnet",
      version: "1.0",
      displayName: "Claude 4.5 Sonnet",
      description: "Anthropic's balanced model providing high intelligence and speed.",
      inputTokenLimit: 200000,
      outputTokenLimit: 4096,
      supportedGenerationMethods: ["generateContent"],
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxTemperature: 2,
      thinking: false
    },
    {
      name: "claude-opus-4.6",
      version: "1.0",
      displayName: "Claude Opus 4.6",
      description: "Next-gen Claude Opus model with upgraded reasoning and accuracy.",
      inputTokenLimit: 200000,
      outputTokenLimit: 4096,
      supportedGenerationMethods: ["generateContent"],
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxTemperature: 2,
      thinking: true
    },
    {
      name: "claude-3.5-sonnet",
      version: "latest",
      displayName: "Claude 3.5 Sonnet",
      description: "Highly capable model from Anthropic, optimized for performance and cost.",
      inputTokenLimit: 200000,
      outputTokenLimit: 8192,
      supportedGenerationMethods: ["generateContent"],
      temperature: 0.7,
      topP: 1,
      topK: 1,
      maxTemperature: 2,
      thinking: false
    },
  {
    name: "xvai-q-4.5",
    version: "4.5",
    displayName: "XvAI Quantum 4.5",
    description: "Quantum-enhanced model created by Nauval akbar for superior reasoning.",
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedGenerationMethods: ["generateContent", "thinking"],
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxTemperature: 2,
    thinking: true
  },
  {
    name: "deepseek-r1",
    version: "r1",
    displayName: "DeepSeek R1",
    description: "DeepSeek's flagship reasoning model with high efficiency.",
    inputTokenLimit: 128000,
    outputTokenLimit: 16384,
    supportedGenerationMethods: ["generateContent"],
    temperature: 0.6,
    topP: 0.95,
    topK: 40,
    maxTemperature: 1.5,
    thinking: true
  }
]

async function handleRequest(req: Request) {
  const apiKey = req.headers.get("x-vs-api-key") || req.headers.get("Authorization")?.split(" ").pop()

  if (!apiKey) {
    return new Response(JSON.stringify({ error: { message: "Missing API Key", type: "invalid_request_error" } }, null, 2), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    })
  }

  const userId = await validateApiKey(apiKey)
  if (!userId) {
    return new Response(JSON.stringify({ error: { message: "Invalid API Key", type: "invalid_request_error" } }, null, 2), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    })
  }

  return new Response(JSON.stringify({ models }, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  })
}

export async function POST(req: Request) {
  return handleRequest(req)
}

export async function GET(req: Request) {
  return handleRequest(req)
}
