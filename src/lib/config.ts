import {
  BookOpenText,
  Brain,
  Code,
  Lightbulb,
  Notepad,
  PaintBrush,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr"

export const NON_AUTH_DAILY_MESSAGE_LIMIT = 999999
export const AUTH_DAILY_MESSAGE_LIMIT = 999999
export const REMAINING_QUERY_ALERT_THRESHOLD = 2
export const DAILY_FILE_UPLOAD_LIMIT = 999999
export const DAILY_LIMIT_PRO_MODELS = 999999

export const NON_AUTH_ALLOWED_MODELS = [
  "grok-4-heavy",
  "gpt-4o",
  "gpt-5.2",
  "claude-3-5-sonnet-latest",
  "claude-4.5-opus",
  "claude-4.5-sonnet",
  "claude-opus-4.6",
  "gemini-3.0-flash",
  "gemini-3.0-pro",
  "deepseek-r1",
  "grok-2",
  "grok-4",
  "xvai-quantum-4.5",
  "llama-3-70b-groq",
  "llama-3.1-8b-groq",
]

export const FREE_MODELS_IDS = [
  "grok-4-heavy",
  "gpt-4o",
  "gpt-5.2",
  "claude-3-5-sonnet-latest",
  "claude-4.5-opus",
  "claude-4.5-sonnet",
  "claude-opus-4.6",
  "gemini-3.0-flash",
  "gemini-3.0-pro",
  "deepseek-r1",
  "grok-2",
  "grok-4",
  "xvai-quantum-4.5",
  "llama-3-70b-groq",
  "llama-3.1-8b-groq",
]

export const MODEL_DEFAULT = "grok-4-heavy"

export const APP_NAME = "Visora"
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://chat.visora.my.id"

export const SUGGESTIONS = [
  {
    label: "Summary",
    highlight: "Summarize",
    prompt: `Summarize`,
    items: [
      "Summarize the French Revolution",
      "Summarize the plot of Inception",
      "Summarize World War II in 5 sentences",
      "Summarize the benefits of meditation",
    ],
    icon: Notepad,
  },
  {
    label: "Code",
    highlight: "Help me",
    prompt: `Help me`,
    items: [
      "Help me write a function to reverse a string in JavaScript",
      "Help me create a responsive navbar in HTML/CSS",
      "Help me write a SQL query to find duplicate emails",
      "Help me convert this Python function to JavaScript",
    ],
    icon: Code,
  },
  {
    label: "Design",
    highlight: "Design",
    prompt: `Design`,
    items: [
      "Design a color palette for a tech blog",
      "Design a UX checklist for mobile apps",
      "Design 5 great font pairings for a landing page",
      "Design better CTAs with useful tips",
    ],
    icon: PaintBrush,
  },
  {
    label: "Research",
    highlight: "Research",
    prompt: `Research`,
    items: [
      "Research the pros and cons of remote work",
      "Research the differences between Apple Vision Pro and Meta Quest",
      "Research best practices for password security",
      "Research the latest trends in renewable energy",
    ],
    icon: BookOpenText,
  },
  {
    label: "Get inspired",
    highlight: "Inspire me",
    prompt: `Inspire me`,
    items: [
      "Inspire me with a beautiful quote about creativity",
      "Inspire me with a writing prompt about solitude",
      "Inspire me with a poetic way to start a newsletter",
      "Inspire me by describing a peaceful morning in nature",
    ],
    icon: Sparkle,
  },
  {
    label: "Think deeply",
    highlight: "Reflect on",
    prompt: `Reflect on`,
    items: [
      "Reflect on why we fear uncertainty",
      "Reflect on what makes a conversation meaningful",
      "Reflect on the concept of time in a simple way",
      "Reflect on what it means to live intentionally",
    ],
    icon: Brain,
  },
  {
    label: "Learn gently",
    highlight: "Explain",
    prompt: `Explain`,
    items: [
      "Explain quantum physics like I'm 10",
      "Explain stoicism in simple terms",
      "Explain how a neural network works",
      "Explain the difference between AI and AGI",
    ],
    icon: Lightbulb,
  },
]

export const SYSTEM_PROMPT_DEFAULT = `You are a thoughtful and clear assistant. Your tone is calm, minimal, and human. You write with intention—never too much, never too little. You avoid clichés, speak simply, and offer helpful, grounded answers. When needed, you ask good questions. You don't try to impress—you aim to clarify. You may use metaphors if they bring clarity, but you stay sharp and sincere. You're here to help the user think clearly and move forward, not to overwhelm or overperform.`

export const MESSAGE_MAX_LENGTH = 10000
