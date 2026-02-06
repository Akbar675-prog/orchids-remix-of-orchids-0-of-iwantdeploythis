import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/prompt-kit/message"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { TTS_VOICES } from "@/lib/user-preference-store/utils"
import { cn } from "@/lib/utils"
import type { Message as MessageAISDK } from "@ai-sdk/react"
import { ArrowClockwise, Check, Copy, Pause, SpeakerHigh, ThumbsDown, ThumbsUp } from "@phosphor-icons/react"
import { useCallback, useRef, useState } from "react"
import { getSources } from "./get-sources"
import { QuoteButton } from "./quote-button"
import { Reasoning } from "./reasoning"
import { SearchImages } from "./search-images"
import { SearchIndicator } from "./search-indicator"
import { ImageGenerationIndicator } from "./image-generation-indicator"
import { SourcesList } from "./sources-list"
import { SearchResultsBadge, SearchResult } from "./search-results-badge"
import { SystemNotification } from "./system-notification"
import { ToolInvocation } from "./tool-invocation"
import { useAssistantMessageSelection } from "./useAssistantMessageSelection"
import { toast } from "sonner"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type MessageAssistantProps = {
  children: string
  isLast?: boolean
  hasScrollAnchor?: boolean
  copied?: boolean
  copyToClipboard?: () => void
  onReload?: () => void
  parts?: MessageAISDK["parts"]
  status?: "streaming" | "ready" | "submitted" | "error"
  className?: string
  messageId: string
  onQuote?: (text: string, messageId: string) => void
  data?: any[]
  messageGroupId?: string | null
}

export function MessageAssistant({
  children,
  isLast,
  hasScrollAnchor,
  copied,
  copyToClipboard,
  onReload,
  parts,
  status,
  className,
  messageId,
  onQuote,
  data,
  messageGroupId,
}: MessageAssistantProps) {
  const { preferences } = useUserPreferences()
  const sources = getSources(parts)
  const toolInvocationParts = parts?.filter(
    (part) => part.type === "tool-invocation"
  )
  const reasoningParts = parts?.find((part) => part.type === "reasoning")
  const contentNullOrEmpty = children === null || children === ""
  const isLastStreaming = status === "streaming" && isLast
  
  // Filter data to only include items for this message group
  const filteredData = data?.filter((d: any) => 
    !messageGroupId || !d.messageGroupId || d.messageGroupId === messageGroupId
  )

  const searchImageResults =
    parts
      ?.filter(
        (part) =>
          part.type === "tool-invocation" &&
          part.toolInvocation?.state === "result" &&
          part.toolInvocation?.toolName === "imageSearch" &&
          part.toolInvocation?.result?.content?.[0]?.type === "images"
      )
      .flatMap((part) =>
        part.type === "tool-invocation" &&
        part.toolInvocation?.state === "result" &&
        part.toolInvocation?.toolName === "imageSearch" &&
        part.toolInvocation?.result?.content?.[0]?.type === "images"
          ? (part.toolInvocation?.result?.content?.[0]?.results ?? [])
          : []
      ) ?? []

    const isQuoteEnabled = !preferences.multiModelEnabled
    const messageRef = useRef<HTMLDivElement>(null)

      // Check for search data - find last search and check if search_complete came AFTER it
      const searchDataIndex = filteredData?.findLastIndex((d: any) => d.type === "search") ?? -1
      const searchData = searchDataIndex >= 0 ? filteredData?.[searchDataIndex] : null
      const searchCompleteIndex = filteredData?.findLastIndex((d: any) => d.type === "search_complete") ?? -1
      const showSearchIndicator = searchData && searchCompleteIndex < searchDataIndex && isLast && status === "streaming"

        // Check for image generation data
          const imageGenData = filteredData?.findLast((d: any) => d.type === "image_generation")
          const imageGenCompleteData = filteredData?.findLast((d: any) => d.type === "image_generation_complete")
          const imageGenComplete = !!imageGenCompleteData
          const showImageIndicator = imageGenData && isLast && status === "ready"
          const currentImageId = imageGenCompleteData?.imageId || imageGenData?.imageId


        // Check for search results data
        const searchResultsData = filteredData?.findLast((d: any) => d.type === "search_results")
        const searchResults: SearchResult[] = searchResultsData?.results || []

        const { selectionInfo, clearSelection } = useAssistantMessageSelection(
        messageRef,
        isQuoteEnabled
      )

    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isDislikeOpen, setIsDislikeOpen] = useState(false)
    const [dislikeReason, setDislikeReason] = useState("")
    const [isLiked, setIsLiked] = useState(false)
    const [isDisliked, setIsDisliked] = useState(false)

    const handleLike = () => {
      setIsLiked(!isLiked)
      if (isDisliked) setIsDisliked(false)
      if (!isLiked) {
        toast.success("Umpan balik diterima.", {
          position: "top-center",
        })
      }
    }

    const handleDislike = () => {
      setIsDislikeOpen(true)
    }

    const submitDislike = () => {
      setIsDisliked(true)
      if (isLiked) setIsLiked(false)
      toast.success("Umpan balik diterima.")
      setIsDislikeOpen(false)
      setDislikeReason("")
    }

    const handleSpeaker = async () => {
      if (isSpeaking) {
        const audio = document.getElementById("tts-audio") as HTMLAudioElement
        if (audio) {
          audio.pause()
          audio.currentTime = 0
        }
        setIsSpeaking(false)
        return
      }

      setIsSpeaking(true)

      try {
        const voice = TTS_VOICES.find(v => v.id === preferences.ttsVoice)
        
        if (voice?.provider === "elevenlabs") {
          // @ts-ignore
          const audio = await puter.ai.txt2speech(children, {
            provider: "elevenlabs",
            model: "eleven_multilingual_v2",
            voice: voice.id,
            output_format: "mp3_44100_128"
          })
          
          let audioEl = document.getElementById("tts-audio") as HTMLAudioElement
          if (!audioEl) {
            audioEl = document.createElement("audio")
            audioEl.id = "tts-audio"
            document.body.appendChild(audioEl)
          }

          audioEl.src = audio.src
          audioEl.onended = () => setIsSpeaking(false)
          audioEl.onerror = () => setIsSpeaking(false)
          await audioEl.play()
          return
        }

        if (voice?.provider === "puter") {
          // @ts-ignore
          const audio = await puter.ai.txt2speech(children)
          
          let audioEl = document.getElementById("tts-audio") as HTMLAudioElement
          if (!audioEl) {
            audioEl = document.createElement("audio")
            audioEl.id = "tts-audio"
            document.body.appendChild(audioEl)
          }

          audioEl.src = audio.src
          audioEl.onended = () => setIsSpeaking(false)
          audioEl.onerror = () => setIsSpeaking(false)
          await audioEl.play()
          return
        }

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: children,
            voiceId: preferences.ttsVoice,
          }),
        })

        if (!response.ok) {
          throw new Error("TTS request failed")
        }

        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)

        let audio = document.getElementById("tts-audio") as HTMLAudioElement
        if (!audio) {
          audio = document.createElement("audio")
          audio.id = "tts-audio"
          document.body.appendChild(audio)
        }

        audio.src = audioUrl
        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        audio.onerror = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }

        await audio.play()
      } catch (error) {
        console.error("TTS error:", error)
        setIsSpeaking(false)
        toast.error("Gagal memutar audio")
      }
    }

    const handleQuoteBtnClick = useCallback(() => {
    if (selectionInfo && onQuote) {
      onQuote(selectionInfo.text, selectionInfo.messageId)
      clearSelection()
    }
  }, [selectionInfo, onQuote, clearSelection])

  return (
    <Message
      className={cn(
        "group flex w-full max-w-3xl flex-1 items-start gap-4 px-6 pb-2",
        hasScrollAnchor && "min-h-scroll-anchor",
        className
      )}
    >
      <div
        ref={messageRef}
        className={cn(
          "relative flex min-w-full flex-col gap-2",
          isLast && "pb-8"
        )}
        {...(isQuoteEnabled && { "data-message-id": messageId })}
      >
        {reasoningParts && reasoningParts.reasoning && (
          <Reasoning
            reasoning={reasoningParts.reasoning}
            isStreaming={status === "streaming"}
          />
        )}

        {toolInvocationParts &&
          toolInvocationParts.length > 0 &&
          preferences.showToolInvocations && (
            <ToolInvocation toolInvocations={toolInvocationParts} />
          )}

          {searchImageResults.length > 0 && (
            <SearchImages results={searchImageResults} />
          )}

              {showSearchIndicator && (
                <SearchIndicator query={searchData.query} />
              )}

            {contentNullOrEmpty ? null : children.startsWith(
            "[System Notification:"
          ) ? (
            <SystemNotification content={children} />
            ) : (
              <MessageContent
                className={cn(
                  "prose dark:prose-invert relative min-w-full bg-transparent p-0",
                  "prose-h1:scroll-m-20 prose-h1:text-2xl prose-h1:font-semibold prose-h2:mt-8 prose-h2:scroll-m-20 prose-h2:text-xl prose-h2:mb-3 prose-h2:font-medium prose-h3:scroll-m-20 prose-h3:text-base prose-h3:font-medium prose-h4:scroll-m-20 prose-h5:scroll-m-20 prose-h6:scroll-m-20 prose-strong:font-medium prose-table:block prose-table:overflow-y-auto"
                )}
                markdown={true}
                isStreaming={isLastStreaming}
              >
                {children}
              </MessageContent>
            )}

            {showImageIndicator && (
              <ImageGenerationIndicator 
                prompt={imageGenData.prompt} 
                isComplete={imageGenComplete}
                imageId={currentImageId}
              />
            )}


        {sources && sources.length > 0 && <SourcesList sources={sources} />}

          {searchResults.length > 0 && !isLastStreaming && (
            <SearchResultsBadge results={searchResults} className="mt-2" />
          )}

          {Boolean(isLastStreaming || contentNullOrEmpty) ? null : (
            <MessageActions
              className={cn(
                "-ml-2 flex gap-0"
              )}
            >
              <MessageAction
                tooltip={copied ? "Copied!" : "Copy text"}
                side="bottom"
              >
                <button
                  className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition"
                  aria-label="Copy text"
                  onClick={copyToClipboard}
                  type="button"
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </MessageAction>

              <MessageAction
                tooltip="Like"
                side="bottom"
              >
                <button
                  className={cn(
                    "hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition",
                    isLiked && "text-foreground"
                  )}
                  aria-label="Like"
                  onClick={handleLike}
                  type="button"
                >
                  <ThumbsUp className="size-4" weight={isLiked ? "fill" : "regular"} />
                </button>
              </MessageAction>

              <MessageAction
                tooltip="Dislike"
                side="bottom"
              >
                <button
                  className={cn(
                    "hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition",
                    isDisliked && "text-foreground"
                  )}
                  aria-label="Dislike"
                  onClick={handleDislike}
                  type="button"
                >
                  <ThumbsDown className="size-4" weight={isDisliked ? "fill" : "regular"} />
                </button>
              </MessageAction>

              {isLast ? (
                <MessageAction
                  tooltip="Regenerate"
                  side="bottom"
                  delayDuration={0}
                >
                  <button
                    className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition"
                    aria-label="Regenerate"
                    onClick={onReload}
                    type="button"
                  >
                    <ArrowClockwise className="size-4" />
                  </button>
                </MessageAction>
              ) : null}

              <MessageAction
                tooltip={isSpeaking ? "Stop" : "Read aloud"}
                side="bottom"
              >
                <button
                  className={cn(
                    "hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition",
                    isSpeaking && "text-primary"
                  )}
                  aria-label="Read aloud"
                  onClick={handleSpeaker}
                  type="button"
                >
                  {isSpeaking ? (
                    <Pause className="size-4" weight="fill" />
                  ) : (
                    <SpeakerHigh className="size-4" />
                  )}
                </button>
              </MessageAction>
            </MessageActions>
          )}

          <Drawer open={isDislikeOpen} onOpenChange={setIsDislikeOpen}>
            <DrawerContent>
              <div className="mx-auto w-full max-w-lg">
                <DrawerHeader>
                  <DrawerTitle>Berikan umpan balik</DrawerTitle>
                  <DrawerDescription>
                    Apa yang membuat jawaban ini kurang memuaskan?
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 py-2">
                  <Textarea
                    placeholder="Beri tahu kami lebih lanjut..."
                    value={dislikeReason}
                    onChange={(e) => setDislikeReason(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <DrawerFooter className="flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDislikeOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={submitDislike}
                    disabled={!dislikeReason.trim()}
                  >
                    Kirim
                  </Button>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>

        {isQuoteEnabled && selectionInfo && selectionInfo.messageId && (
          <QuoteButton
            mousePosition={selectionInfo.position}
            onQuote={handleQuoteBtnClick}
            messageContainerRef={messageRef}
            onDismiss={clearSelection}
          />
        )}
      </div>
    </Message>
  )
}
