"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ChatInput } from "@/app/components/chat-input/chat-input"
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import { MessageContent } from "@/components/prompt-kit/message"
import { uploadFile } from "@/lib/file-handling"
import { MODEL_DEFAULT } from "@/lib/config"

interface Message {
  id: string
  created_at: string
  user_id: string
  content: string
  channel: string
  attachment_url?: string
  attachment_type?: string
  attachment_name?: string
  user_email?: string
  user_image?: string
  user_display_name?: string
}

interface User {
  id: string
  email: string
  profile_image: string
  display_name: string
}

export function GlobalChatContainer({ channel, user }: { channel: string; user: User }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [enableSearch, setEnableSearch] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  const selectedModel = useMemo(() => MODEL_DEFAULT, [])

  const getDisplayName = (displayName?: string, email?: string) => {
    if (displayName && displayName !== "User") return displayName
    if (email) return email.split("@")[0]
    return "User"
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/user-profile/${userId}`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (!supabase) return
    fetchMessages()

    const channelSub = supabase
      .channel("global-chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "global_messages",
          filter: `channel=eq.${channel}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })

          const userData = await fetchUserProfile(newMessage.user_id)

          if (userData) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === newMessage.id
                  ? {
                      ...msg,
                      user_email: userData.email,
                      user_image: userData.profile_image,
                      user_display_name: userData.display_name,
                    }
                  : msg
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelSub)
    }
  }, [channel, supabase])

  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const fetchMessages = async () => {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from("global_messages")
        .select("id, created_at, user_id, content, channel, attachment_url, attachment_type, attachment_name")
        .eq("channel", channel)
        .order("created_at", { ascending: true })
        .limit(100)

      if (error) throw error

      const messagesWithoutProfiles = (data || []).map((msg: any) => ({
        ...msg,
        user_email: undefined,
        user_image: undefined,
        user_display_name: undefined,
      }))

      setMessages(messagesWithoutProfiles)

      const uniqueUserIds = [...new Set((data || []).map((msg: any) => msg.user_id))]
      const profilePromises = uniqueUserIds.map(async (userId) => {
        const profile = await fetchUserProfile(userId as string)
        return { userId, profile }
      })

      const profiles = await Promise.all(profilePromises)
      const profileMap = new Map(profiles.map(p => [p.userId, p.profile]))

      setMessages((prev) =>
        prev.map((msg) => {
          const profile = profileMap.get(msg.user_id)
          if (profile) {
            return {
              ...msg,
              user_email: profile.email,
              user_image: profile.profile_image,
              user_display_name: profile.display_name,
            }
          }
          return msg
        })
      )
    } catch (err) {
      console.error("Error fetching messages:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!supabase || uploading) return
    if (!input.trim() && files.length === 0) return

    setUploading(true)
    let attachmentUrl = ""
    let attachmentType = ""
    let attachmentName = ""

    const file = files[0]
    if (file) {
      try {
        attachmentUrl = await uploadFile(supabase, file)
        attachmentType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "file"
        attachmentName = file.name
      } catch (err) {
        console.error("Upload error:", err)
        setUploading(false)
        return
      }
    }

    const optimisticId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: optimisticId,
      created_at: new Date().toISOString(),
      user_id: user.id,
      content: input,
      channel,
      attachment_url: attachmentUrl || undefined,
      attachment_type: attachmentType || undefined,
      attachment_name: attachmentName || undefined,
      user_email: user.email,
      user_image: user.profile_image,
      user_display_name: user.display_name,
    }

    setMessages((prev) => [...prev, optimisticMessage])

    try {
      const { data, error } = await supabase
        .from("global_messages")
        .insert({
          user_id: user.id,
          content: input,
          channel,
          attachment_url: attachmentUrl || null,
          attachment_type: attachmentType || null,
          attachment_name: attachmentName || null,
        })
        .select(
          "id, created_at, user_id, content, channel, attachment_url, attachment_type, attachment_name"
        )
        .single()

      if (error) throw error

      if (data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticId
              ? {
                  ...data,
                  user_email: user.email,
                  user_image: user.profile_image,
                  user_display_name: user.display_name,
                }
              : msg
          )
        )
      }

      setInput("")
      setFiles([])
    } catch (err) {
      console.error("Error sending message:", err)
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = (newFiles: File[]) => {
    if (newFiles.length === 0) return
    setFiles((prev) => [...prev, ...newFiles].slice(0, 1))
  }

  const handleFileRemove = (file: File) => {
    setFiles((prev) => prev.filter((f) => f !== file))
  }

  return (
    <div className="@container/main relative flex h-full flex-col items-center justify-end md:justify-center">
      <div className="relative flex h-full w-full flex-col items-center overflow-x-hidden overflow-y-auto">
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 mx-auto flex w-full flex-col justify-center">
          <div className="h-app-header bg-background flex w-full lg:hidden lg:h-0" />
          <div className="h-app-header bg-background flex w-full mask-b-from-4% mask-b-to-100% lg:hidden" />
        </div>
        <ChatContainerRoot className="relative w-full">
          <ChatContainerContent
            className="flex w-full flex-col items-center pt-20 pb-4"
            style={{
              scrollbarGutter: "stable both-edges",
              scrollbarWidth: "none",
            }}
          >
            {messages.map((msg) => {
              const isSelf = msg.user_id === user.id
              const timeLabel = new Date(msg.created_at).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
                const displayName = getDisplayName(msg.user_display_name, msg.user_email)

              return (
                <div
                  key={msg.id}
                  className={`group flex w-full max-w-3xl flex-col ${
                    isSelf ? "items-end" : "items-start"
                  } gap-0.5 px-6 pb-2`}
                >
                  <div className={`flex items-center gap-2 pb-1 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
                    <img
                      src={
                        msg.user_image ||
                        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                      }
                      alt="Avatar"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {displayName}
                    </span>
                  </div>
                  {msg.attachment_url && (
                    <div className="mb-2 max-w-[70%]">
                      {msg.attachment_type === "image" ? (
                        <img
                          src={msg.attachment_url}
                          alt={msg.attachment_name || "Attachment"}
                          className="max-w-full rounded-2xl"
                        />
                      ) : msg.attachment_type === "video" ? (
                        <video
                          src={msg.attachment_url}
                          controls
                          className="max-w-full rounded-2xl"
                        />
                      ) : (
                        <a
                          href={msg.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline"
                        >
                          {msg.attachment_name || "File"}
                        </a>
                      )}
                    </div>
                  )}
                  {msg.content && (
                    <MessageContent
                      className={`relative max-w-[70%] rounded-3xl px-5 py-2.5 ${
                        isSelf
                          ? "bg-blue-600 text-white"
                          : "bg-muted text-foreground"
                      }`}
                      markdown={true}
                    >
                      {msg.content}
                    </MessageContent>
                  )}
                  <span
                    className={`text-[10px] text-muted-foreground ${
                      isSelf ? "self-end" : "self-start"
                    }`}
                  >
                    {timeLabel}
                  </span>
                </div>
              )
            })}
            {loading && (
              <div className="flex w-full max-w-3xl px-6 pb-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
              </div>
            )}
            <div ref={scrollAnchorRef} className="h-px w-full" />
          </ChatContainerContent>
        </ChatContainerRoot>
      </div>

      <div className="relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl">
        <ChatInput
          value={input}
          onValueChange={setInput}
          onSend={handleSend}
          isSubmitting={uploading}
          files={files}
          onFileUpload={handleFileUpload}
          onFileRemove={handleFileRemove}
          onSuggestion={() => {}}
          hasSuggestions={false}
          onSelectModel={() => {}}
          selectedModel={selectedModel}
          isUserAuthenticated={true}
          stop={() => {}}
          status="ready"
          setEnableSearch={setEnableSearch}
          enableSearch={enableSearch}
          quotedText={null}
          hideModelSelector={true}
          hideSearch={true}
        />
      </div>
    </div>
  )
}
