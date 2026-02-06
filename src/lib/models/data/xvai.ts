import { openproviders } from "@/lib/openproviders"
import { ModelConfig } from "../types"

const xvaiModels: ModelConfig[] = [
    {
      id: "xvai-quantum-4.5",
      name: "XvAI Quantum 4.5",
    provider: "XvAI",
    providerId: "xvai",
    modelFamily: "Quantum",
    baseProviderId: "openai",
    description: "Next-generation quantum-enhanced language model",
    tags: ["advanced", "quantum", "next-gen"],
    contextWindow: 1000000,
    inputCost: 5.0,
    outputCost: 15.0,
    priceUnit: "per 1M tokens",
    vision: true,
    tools: true,
    audio: true,
    openSource: false,
    speed: "Fast",
    website: "https://xvai.com",
    apiDocs: "https://docs.xvai.com",
      modelPage: "https://xvai.com/quantum",
      icon: "xvai", // Fallback icon
      apiSdk: (apiKey?: string) =>

      openproviders("xvai-quantum-4.5", undefined, apiKey),
  },
]

export { xvaiModels }
