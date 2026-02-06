"use client"

import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { TTS_VOICES } from "@/lib/user-preference-store/utils"
import { cn } from "@/lib/utils"
import { Check, Pause, SpeakerHigh } from "@phosphor-icons/react"
import Image from "next/image"
import { useState, useRef } from "react"

export function TtsVoiceSettings() {
  const { preferences, setTtsVoice } = useUserPreferences()
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playPreview = async (e: React.MouseEvent, voiceId: string, text: string) => {
    e.stopPropagation()

    if (playingId === voiceId) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    try {
      setPlayingId(voiceId)
      const voice = TTS_VOICES.find(v => v.id === voiceId)

        if (voice?.provider === "elevenlabs") {
          // @ts-ignore
          const audio = await puter.ai.txt2speech(text, {
            provider: "elevenlabs",
            model: "eleven_multilingual_v2",
            voice: voice.id,
            output_format: "mp3_44100_128"
          })

          if (audioRef.current) {
            audioRef.current.src = audio.src
            audioRef.current.play()
            audioRef.current.onended = () => {
              setPlayingId(null)
            }
          } else {
            const audioEl = new Audio(audio.src)
            audioRef.current = audioEl
            audioEl.play()
            audioEl.onended = () => {
              setPlayingId(null)
            }
          }
          return
        }

        if (voice?.provider === "puter") {
          // @ts-ignore
          const audio = await puter.ai.txt2speech(text)

          if (audioRef.current) {
            audioRef.current.src = audio.src
            audioRef.current.play()
            audioRef.current.onended = () => {
              setPlayingId(null)
            }
          } else {
            const audioEl = new Audio(audio.src)
            audioRef.current = audioEl
            audioEl.play()
            audioEl.onended = () => {
              setPlayingId(null)
            }
          }
          return
        }


      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      })

      if (!response.ok) throw new Error("Failed to get audio")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        audioRef.current.onended = () => {
          setPlayingId(null)
          URL.revokeObjectURL(url)
        }
      } else {
        const audio = new Audio(url)
        audioRef.current = audio
        audio.play()
        audio.onended = () => {
          setPlayingId(null)
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error("Error playing preview:", error)
      setPlayingId(null)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">TTS - Voice</h3>
        <p className="text-muted-foreground text-xs">
          Pilih suara untuk text-to-speech
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TTS_VOICES.map((voice) => {
          const isSelected = preferences.ttsVoice === voice.id
          const isPlaying = playingId === voice.id

          return (
            <button
              key={voice.id}
              onClick={() => setTtsVoice(voice.id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50 hover:bg-accent/50"
              )}
            >
              <div className="relative size-10 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src={voice.avatarUrl}
                  alt={voice.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="text-sm font-medium">{voice.name}</span>
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                  {voice.language}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  onClick={(e) => playPreview(e, voice.id, voice.sampleText)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full transition-all",
                    isPlaying
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                  )}
                >
                {isPlaying ? (
                    <Pause className="size-4" weight="fill" />
                  ) : (
                    <SpeakerHigh className="size-4" />
                  )}
                </div>

                {isSelected && (
                  <div className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full">
                    <Check className="size-3" weight="bold" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
