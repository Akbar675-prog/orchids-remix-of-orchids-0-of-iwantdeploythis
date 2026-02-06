export type LayoutType = "sidebar" | "fullscreen"

export type TtsVoice = {
  id: string
  name: string
  avatarUrl: string
  sampleText: string
  language: string
  provider?: "elevenlabs" | "puter"
}

export const TTS_VOICES: TtsVoice[] = [
  {
    id: "UgBBYS2sOqTuMpoF3BR0",
    name: "Mark",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mark",
    sampleText: "Hello, I am Mark. I can speak English.",
    language: "en",
    provider: "elevenlabs",
  },
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel",
    sampleText: "Hello, I am Rachel. How can I help you today?",
    language: "en",
    provider: "elevenlabs",
  },
  {
    id: "cOfrdzGy8S6oHQrFrI7b",
    name: "Kaguya",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kaguya",
    sampleText: "こんにちは、かぐyaです。日本語を話せます。",
    language: "ja",
    provider: "elevenlabs",
  },
  {
    id: "GrxM8OEUWBzyFR2xP2Qd",
    name: "Agus",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Agus",
    sampleText: "Halo, saya Agus. Saya bisa berbicara bahasa Indonesia.",
    language: "id",
    provider: "elevenlabs",
  },
  {
    id: "puter-en-male",
    name: "Puter Male (Free)",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=PuterMale",
    sampleText: "Hello, I am a free voice from Puter. How can I help you?",
    language: "en",
    provider: "puter",
  },
  {
    id: "puter-en-female",
    name: "Puter Female (Free)",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=PuterFemale",
    sampleText: "Hi there! I am a free female voice powered by Puter.",
    language: "en",
    provider: "puter",
  },
  {
    id: "puter-id-female",
    name: "Lestari (Free)",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lestari",
    sampleText: "Halo! Saya Lestari, suara gratis dari Puter.",
    language: "id",
    provider: "puter",
  },
]


export type UserPreferences = {
  layout: LayoutType
  promptSuggestions: boolean
  showToolInvocations: boolean
  showConversationPreviews: boolean
  multiModelEnabled: boolean
  hiddenModels: string[]
  ttsVoice: string
  receiveNotifications: boolean
}

export const defaultPreferences: UserPreferences = {
  layout: "fullscreen",
  promptSuggestions: true,
  showToolInvocations: true,
  showConversationPreviews: true,
  multiModelEnabled: false,
  hiddenModels: [],
  ttsVoice: "UgBBYS2sOqTuMpoF3BR0",
  receiveNotifications: false,
}

// Helper functions to convert between API format (snake_case) and frontend format (camelCase)
export function convertFromApiFormat(apiData: any): UserPreferences {
  return {
    layout: apiData.layout || "fullscreen",
    promptSuggestions: apiData.prompt_suggestions ?? true,
    showToolInvocations: apiData.show_tool_invocations ?? true,
    showConversationPreviews: apiData.show_conversation_previews ?? true,
    multiModelEnabled: apiData.multi_model_enabled ?? false,
    hiddenModels: apiData.hidden_models || [],
    ttsVoice: apiData.tts_voice || "UgBBYS2sOqTuMpoF3BR0",
    receiveNotifications: apiData.receive_notifications ?? false,
  }
}

export function convertToApiFormat(preferences: Partial<UserPreferences>) {
  const apiData: any = {}
  if (preferences.layout !== undefined) apiData.layout = preferences.layout
  if (preferences.promptSuggestions !== undefined)
    apiData.prompt_suggestions = preferences.promptSuggestions
  if (preferences.showToolInvocations !== undefined)
    apiData.show_tool_invocations = preferences.showToolInvocations
  if (preferences.showConversationPreviews !== undefined)
    apiData.show_conversation_previews = preferences.showConversationPreviews
  if (preferences.multiModelEnabled !== undefined)
    apiData.multi_model_enabled = preferences.multiModelEnabled
  if (preferences.hiddenModels !== undefined)
    apiData.hidden_models = preferences.hiddenModels
  if (preferences.ttsVoice !== undefined)
    apiData.tts_voice = preferences.ttsVoice
  if (preferences.receiveNotifications !== undefined)
    apiData.receive_notifications = preferences.receiveNotifications
  return apiData
}
