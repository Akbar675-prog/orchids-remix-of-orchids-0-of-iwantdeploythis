import { NextRequest, NextResponse } from "next/server"

const API_KEYS = [
  process.env.ELEVENLABS_API_KEY_1,
  process.env.ELEVENLABS_API_KEY_2,
].filter(Boolean) as string[]

let currentKeyIndex = 0

function getNextApiKey(): string | null {
  if (API_KEYS.length === 0) return null
  const key = API_KEYS[currentKeyIndex]
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
  return key
}

async function tryWithKey(apiKey: string, text: string, voiceId: string) {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: "text and voiceId are required" },
        { status: 400 }
      )
    }

    if (API_KEYS.length === 0) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      )
    }

      for (let i = 0; i < API_KEYS.length; i++) {
        const apiKey = getNextApiKey()
        if (!apiKey) continue

        try {
          const response = await tryWithKey(apiKey, text, voiceId)

          if (response.ok) {
            const audioBuffer = await response.arrayBuffer()
            return new NextResponse(audioBuffer, {
              headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.byteLength.toString(),
              },
            })
          }

          const errorText = await response.text()
          console.warn(`ElevenLabs API key ${i+1} failed with status ${response.status}:`, errorText)

          if (response.status === 401 || response.status === 429) {
            continue
          }

          return NextResponse.json(
            { error: `ElevenLabs API error: ${errorText}` },
            { status: response.status }
          )
        } catch (fetchError) {
          console.error(`Fetch error with API key ${i+1}:`, fetchError)
          continue
        }
      }

    return NextResponse.json(
      { error: "All API keys exhausted or failed" },
      { status: 503 }
    )
  } catch (error) {
    console.error("TTS API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
