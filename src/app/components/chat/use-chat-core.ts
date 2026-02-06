import { syncRecentMessages } from "@/app/components/chat/syncRecentMessages"
import { useChatDraft } from "@/app/hooks/use-chat-draft"
import { toast } from "@/components/ui/toast"
import { getOrCreateGuestUserId } from "@/lib/api"
import { useChats } from "@/lib/chat-store/chats/provider"
import { MESSAGE_MAX_LENGTH, SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
import { Attachment } from "@/lib/file-handling"
import { API_ROUTE_CHAT } from "@/lib/routes"
import type { UserProfile } from "@/lib/user/types"
import { getModelInfo } from "@/lib/models"
import { getPersonaPrompt } from "@/lib/models/personas"
import type { Message } from "@ai-sdk/react"
import { useChat } from "@ai-sdk/react"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type UseChatCoreProps = {
  initialMessages: Message[]
  draftValue: string
  cacheAndAddMessage: (message: Message) => void
  chatId: string | null
  user: UserProfile | null
  files: File[]
  createOptimisticAttachments: (
    files: File[]
  ) => Array<{ name: string; contentType: string; url: string }>
  setFiles: (files: File[]) => void
  checkLimitsAndNotify: (uid: string) => Promise<boolean>
  cleanupOptimisticAttachments: (attachments?: Array<{ url?: string }>) => void
  ensureChatExists: (uid: string, input: string) => Promise<string | null>
  handleFileUploads: (
    uid: string,
    chatId: string
  ) => Promise<Attachment[] | null>
  selectedModel: string
  clearDraft: () => void
  bumpChat: (chatId: string) => void
}

export function useChatCore({
  initialMessages,
  draftValue,
  cacheAndAddMessage,
  chatId,
  user,
  files,
  createOptimisticAttachments,
  setFiles,
  checkLimitsAndNotify,
  cleanupOptimisticAttachments,
  ensureChatExists,
  handleFileUploads,
  selectedModel,
  clearDraft,
  bumpChat,
}: UseChatCoreProps) {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [hasDialogAuth, setHasDialogAuth] = useState(false)
  const [enableSearch, setEnableSearch] = useState(false)

  // Refs and derived state
  const hasSentFirstMessageRef = useRef(false)
  const prevChatIdRef = useRef<string | null>(chatId)
  const isAuthenticated = useMemo(() => !!user?.id, [user?.id])
  const systemPrompt = useMemo(
    () => user?.system_prompt || SYSTEM_PROMPT_DEFAULT,
    [user?.system_prompt]
  )

  // Search params handling
  const searchParams = useSearchParams()
  const prompt = searchParams.get("prompt")

  // Chats operations
  const { updateTitle } = useChats()

  // Handle errors directly in onError callback
  const handleError = useCallback((error: Error) => {
    console.error("Chat error:", error)
    console.error("Error message:", error.message)
    let errorMsg = error.message || "Something went wrong."

    if (errorMsg === "An error occurred" || errorMsg === "fetch failed") {
      errorMsg = "Something went wrong. Please try again."
    }

    toast({
      title: errorMsg,
      status: "error",
    })
  }, [])

  // Initialize useChat
  const {
    messages,
    input,
    handleSubmit,
    status,
    error,
    reload,
    stop,
    setMessages,
    setInput,
    append,
    data,
  } = useChat({
    api: API_ROUTE_CHAT,
    initialMessages,
    initialInput: draftValue,
    onFinish: async (m) => {
      cacheAndAddMessage(m)
      try {
        const effectiveChatId =
          chatId ||
          prevChatIdRef.current ||
          (typeof window !== "undefined"
            ? localStorage.getItem("guestChatId")
            : null)

        if (!effectiveChatId) return
        await syncRecentMessages(effectiveChatId, setMessages, 2)
      } catch (error) {
        console.error("Message ID reconciliation failed: ", error)
      }
    },
    onError: handleError,
  })

  // Handle search params on mount
  useEffect(() => {
    if (prompt && typeof window !== "undefined") {
      requestAnimationFrame(() => setInput(prompt))
    }
  }, [prompt, setInput])

  // Reset messages when navigating from a chat to home
  useEffect(() => {
    if (
      prevChatIdRef.current !== null &&
      chatId === null &&
      messages.length > 0
    ) {
      setMessages([])
    }
    prevChatIdRef.current = chatId
  }, [chatId, messages.length, setMessages])

  // Submit action
  const submit = useCallback(async () => {
    setIsSubmitting(true)

    const uid = await getOrCreateGuestUserId(user)
    if (!uid) {
      setIsSubmitting(false)
      return
    }

    const puterModels: string[] = []
    const isPuterModel = puterModels.includes(selectedModel)
    const puter = typeof window !== "undefined" ? (window as any).puter : null

    if (isPuterModel && puter) {
      const messageGroupId = Date.now().toString()
      const userContent = input
      const optimisticId = `optimistic-${Date.now().toString()}`
      const APP_DOMAIN = "https://chat.visora.my.id"
      
      const optimisticAttachments =
        files.length > 0 ? createOptimisticAttachments(files) : []

      const optimisticMessage = {
        id: optimisticId,
        content: input,
        role: "user" as const,
        createdAt: new Date(),
        experimental_attachments:
          optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
      }

      setMessages((prev) => [...prev, optimisticMessage])
      setInput("")

      const submittedFiles = [...files]
      setFiles([])

      try {
        const allowed = await checkLimitsAndNotify(uid)
        if (!allowed) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
          cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
          return
        }

        const currentChatId = await ensureChatExists(uid, userContent)
        if (!currentChatId) {
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
          cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
          return
        }

        prevChatIdRef.current = currentChatId

        let attachments: Attachment[] | null = []
        if (submittedFiles.length > 0) {
          attachments = await handleFileUploads(uid, currentChatId)
          if (attachments === null) {
            setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
            cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
            return
          }
        }

        const firstImage = attachments?.find(a => a.contentType.startsWith("image/"))
        let imageUrl = firstImage?.url
        if (imageUrl && imageUrl.startsWith("/")) {
          imageUrl = `${APP_DOMAIN}${imageUrl}`
        }

        // Save user message to DB
        await fetch("/api/chat/save", {
          method: "POST",
          body: JSON.stringify({
            chatId: currentChatId,
            userId: uid,
            role: "user",
            content: userContent,
            model: selectedModel,
            isAuthenticated,
            message_group_id: messageGroupId,
            attachments: attachments || [],
          })
        })

        // Call Puter AI
          const puterModelMap: Record<string, string> = {
            "grok-4": "x-ai/grok-4.1-fast",
            "grok-4-heavy": "x-ai/grok-4-heavy",
            "grok-2": "x-ai/grok-2",
            "claude-3-5-sonnet-latest": "claude-3-5-sonnet",
            "claude-4.5-sonnet": "claude-sonnet-4-5",
            "claude-4.5-opus": "claude-opus-4-5",
            "claude-opus-4.6": "claude-opus-4-6",
          }
        
        const puterModel = puterModelMap[selectedModel] || "gpt-4o"

        // Add assistant message for streaming
        const assistantId = `assistant-${Date.now().toString()}`
        setMessages((prev) => [
          ...prev.filter(m => m.id !== optimisticId),
          optimisticMessage,
          {
            id: assistantId,
            content: "",
            role: "assistant",
            createdAt: new Date(),
          }
        ])

        let assistantContent = ""
        const options = { model: puterModel, stream: true }
        
        const modelInfo = getModelInfo(selectedModel)
        const modelName = modelInfo?.name || selectedModel
        const providerName = modelInfo?.provider || "AI"
        const personaPrompt = getPersonaPrompt(selectedModel, modelName, providerName)
        const finalUserContent = personaPrompt ? `${personaPrompt}\n\nUser: ${userContent}` : userContent

        let stream
        if (imageUrl) {
          stream = await puter.ai.chat(finalUserContent, imageUrl, options)
        } else {
          stream = await puter.ai.chat(finalUserContent, options)
        }

        for await (const part of stream) {
          if (part.type === 'text') {
            const words = part.text.split(/(\s+)/);
            for (const word of words) {
              assistantContent += word;
              setMessages((prev) => 
                prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
                  if (word.trim().length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 30));
                  }

            }
          }
        }

        // Save assistant message to DB
        await fetch("/api/chat/save", {
          method: "POST",
          body: JSON.stringify({
            chatId: currentChatId,
            userId: uid,
            role: "assistant",
            content: assistantContent,
            model: selectedModel,
            isAuthenticated,
            message_group_id: messageGroupId,
          })
        })

        cacheAndAddMessage(optimisticMessage)
        cacheAndAddMessage({
          id: assistantId,
          content: assistantContent,
          role: "assistant",
          createdAt: new Date(),
        })
        
        clearDraft()
        if (messages.length > 0) {
          bumpChat(currentChatId)
        }
      } catch (err) {
        console.error("Puter AI Error:", err)
        toast({ title: `${selectedModel} (Puter.js) failed.`, status: "error" })
      } finally {
        setIsSubmitting(false)
        return
      }
    }

    const optimisticId = `optimistic-${Date.now().toString()}`
    const optimisticAttachments =
      files.length > 0 ? createOptimisticAttachments(files) : []

    const optimisticMessage = {
      id: optimisticId,
      content: input,
      role: "user" as const,
      createdAt: new Date(),
      experimental_attachments:
        optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setInput("")

    const submittedFiles = [...files]
    setFiles([])

    // Deployment logic
    const isDeployCommand =
      input.toLowerCase().includes("deploy") && submittedFiles.length > 0

    if (isDeployCommand) {
      setIsDeploying(true)
      try {
        const formData = new FormData()
        formData.append("guestId", uid)
        submittedFiles.forEach((file) => formData.append("files", file))

        const response = await fetch("/api/deploy", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error("Deployment failed")

        const { results } = await response.json()
        const urls = results
          .map((r: any) => `- ${r.name}: ${window.location.origin}${r.url}`)
          .join("\n")

        const deploymentMessage = `I have successfully deployed the files. Here are the URLs:\n${urls}\n\nPlease inform the user that their site is now online at these locations.`

        // Clear input and send to AI
        const options = {
          body: {
            chatId: await ensureChatExists(uid, input),
            userId: uid,
            model: selectedModel,
            isAuthenticated,
            systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
            localTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }

        append(
          {
            role: "user",
            content: `[System Notification: Files deployed successfully]\n\nUser requested deployment. Files are live at:\n${urls}\n\nPlease confirm this to the user in a friendly way.`,
          },
          options
        )
        
        setIsSubmitting(false)
        setIsDeploying(false)
        return
      } catch (error) {
        console.error("Deployment failed:", error)
        toast({ title: "Deployment failed", status: "error" })
        setIsDeploying(false)
        setIsSubmitting(false)
        return
      }
    }

    try {
      const allowed = await checkLimitsAndNotify(uid)
      if (!allowed) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        return
      }

      const currentChatId = await ensureChatExists(uid, input)
      if (!currentChatId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        return
      }

      prevChatIdRef.current = currentChatId

      if (input.length > MESSAGE_MAX_LENGTH) {
        toast({
          title: `The message you submitted was too long, please submit something shorter. (Max ${MESSAGE_MAX_LENGTH} characters)`,
          status: "error",
        })
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        return
      }

      let attachments: Attachment[] | null = []
      if (submittedFiles.length > 0) {
        attachments = await handleFileUploads(uid, currentChatId)
        if (attachments === null) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
          cleanupOptimisticAttachments(
            optimisticMessage.experimental_attachments
          )
          return
        }
      }

      const options = {
        body: {
          chatId: currentChatId,
          userId: uid,
          model: selectedModel,
          isAuthenticated,
          systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
          enableSearch,
          localTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        experimental_attachments: attachments || undefined,
      }

      handleSubmit(undefined, options)
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      cacheAndAddMessage(optimisticMessage)
      clearDraft()

      if (messages.length > 0) {
        bumpChat(currentChatId)
      }
    } catch {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      toast({ title: "Failed to send message", status: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }, [
    user,
    files,
    createOptimisticAttachments,
    input,
    setMessages,
    setInput,
    setFiles,
    checkLimitsAndNotify,
    cleanupOptimisticAttachments,
    ensureChatExists,
    handleFileUploads,
    selectedModel,
    isAuthenticated,
    systemPrompt,
    enableSearch,
    handleSubmit,
    cacheAndAddMessage,
    clearDraft,
    messages.length,
    bumpChat,
    setIsSubmitting,
  ])

  const submitEdit = useCallback(
    async (messageId: string, newContent: string) => {
      // Block edits while sending/streaming
      if (isSubmitting || status === "submitted" || status === "streaming") {
        toast({
          title: "Please wait until the current message finishes sending.",
          status: "error",
        })
        return
      }

      if (!newContent.trim()) return

      if (!chatId) {
        toast({ title: "Missing chat.", status: "error" })
        return
      }

      // Find edited message
      const editIndex = messages.findIndex(
        (m) => String(m.id) === String(messageId)
      )
      if (editIndex === -1) {
        toast({ title: "Message not found", status: "error" })
        return
      }

      const target = messages[editIndex]
      const cutoffIso = target?.createdAt?.toISOString()
      if (!cutoffIso) {
        console.error("Unable to locate message timestamp.")
        return
      }

      if (newContent.length > MESSAGE_MAX_LENGTH) {
        toast({
          title: `The message you submitted was too long, please submit something shorter. (Max ${MESSAGE_MAX_LENGTH} characters)`,
          status: "error",
        })
        return
      }

      // Store original messages for potential rollback
      const originalMessages = [...messages]

      const optimisticId = `optimistic-edit-${Date.now().toString()}`
      const optimisticEditedMessage = {
        id: optimisticId,
        content: newContent,
        role: "user" as const,
        createdAt: new Date(),
        experimental_attachments: target.experimental_attachments || undefined,
      }

      try {
        const trimmedMessages = messages.slice(0, editIndex)
        setMessages([...trimmedMessages, optimisticEditedMessage])

        try {
          const { writeToIndexedDB } = await import("@/lib/chat-store/persist")
          await writeToIndexedDB("messages", {
            id: chatId,
            messages: trimmedMessages,
          })
        } catch {}

        // Get user validation
        const uid = await getOrCreateGuestUserId(user)
        if (!uid) {
          setMessages(originalMessages)
          toast({ title: "Please sign in and try again.", status: "error" })
          return
        }

        const allowed = await checkLimitsAndNotify(uid)
        if (!allowed) {
          setMessages(originalMessages)
          return
        }

        const currentChatId = await ensureChatExists(uid, newContent)
        if (!currentChatId) {
          setMessages(originalMessages)
          return
        }

        prevChatIdRef.current = currentChatId

        const puterModels: string[] = []
        const isPuterModel = puterModels.includes(selectedModel)
        const puter = typeof window !== "undefined" ? (window as any).puter : null

        if (isPuterModel && puter) {
          const messageGroupId = Date.now().toString()
          const assistantId = `assistant-edit-${Date.now().toString()}`
          const APP_DOMAIN = "https://chat.visora.my.id"

          setMessages((prev) => [
            ...prev.filter(m => m.id !== optimisticId),
            optimisticEditedMessage,
            {
              id: assistantId,
              content: "",
              role: "assistant",
              createdAt: new Date(),
            }
          ])

          try {
            const puterModelMap: Record<string, string> = {
              "grok-4": "x-ai/grok-4.1-fast",
              "grok-4-heavy": "x-ai/grok-4-heavy",
              "grok-2": "x-ai/grok-2",
              "claude-3-5-sonnet-latest": "claude-3-5-sonnet",
              "claude-4.5-sonnet": "claude-sonnet-4-5",
              "claude-4.5-opus": "claude-opus-4-5",
            }
            const puterModel = puterModelMap[selectedModel] || "gpt-4o"

            const firstImage = target.experimental_attachments?.find(a => a.contentType?.startsWith("image/"))
            let imageUrl = firstImage?.url
            if (imageUrl && imageUrl.startsWith("/")) {
              imageUrl = `${APP_DOMAIN}${imageUrl}`
            }

            let assistantContent = ""
            const options = { model: puterModel, stream: true }
            
            const modelInfo = getModelInfo(selectedModel)
            const modelName = modelInfo?.name || selectedModel
            const providerName = modelInfo?.provider || "AI"
            const personaPrompt = getPersonaPrompt(selectedModel, modelName, providerName)
            const finalUserContent = personaPrompt ? `${personaPrompt}\n\nUser: ${newContent}` : newContent

            let stream
            if (imageUrl) {
              stream = await puter.ai.chat(finalUserContent, imageUrl, options)
            } else {
              stream = await puter.ai.chat(finalUserContent, options)
            }

            for await (const part of stream) {
              if (part.type === 'text') {
                const words = part.text.split(/(\s+)/);
                for (const word of words) {
                  assistantContent += word;
                  setMessages((prev) => 
                    prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
                  );
                    if (word.trim().length > 0) {
                      await new Promise(resolve => setTimeout(resolve, 30));
                    }

                }
              }
            }

            await fetch("/api/chat/save", {
              method: "POST",
              body: JSON.stringify({
                chatId: currentChatId,
                userId: uid,
                role: "assistant",
                content: assistantContent,
                model: selectedModel,
                isAuthenticated,
                message_group_id: messageGroupId,
              })
            })

            cacheAndAddMessage(optimisticEditedMessage)
            cacheAndAddMessage({
              id: assistantId,
              content: assistantContent,
              role: "assistant",
              createdAt: new Date(),
            })

            bumpChat(currentChatId)
            return
          } catch (err) {
            console.error("Puter AI Edit Error:", err)
            toast({ title: `${selectedModel} (Puter.js) edit failed.`, status: "error" })
            setMessages(originalMessages)
            return
          }
        }

        const options = {
          body: {
            chatId: currentChatId,
            userId: uid,
            model: selectedModel,
            isAuthenticated,
            systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
            enableSearch,
            editCutoffTimestamp: cutoffIso, // Backend will delete messages from this timestamp
            localTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          experimental_attachments:
            target.experimental_attachments || undefined,
        }

        // If this is an edit of the very first user message, update chat title
        if (editIndex === 0 && target.role === "user") {
          try {
            await updateTitle(currentChatId, newContent)
          } catch {}
        }

        append(
          {
            role: "user",
            content: newContent,
          },
          options
        )

        // Remove optimistic message
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))

        bumpChat(currentChatId)
      } catch (error) {
        console.error("Edit failed:", error)
        setMessages(originalMessages)
        toast({ title: "Failed to apply edit", status: "error" })
      }
    },
    [
      chatId,
      messages,
      user,
      checkLimitsAndNotify,
      ensureChatExists,
      selectedModel,
      isAuthenticated,
      systemPrompt,
      enableSearch,
      append,
      setMessages,
      bumpChat,
      updateTitle,
      isSubmitting,
      status,
    ]
  )

  // Handle suggestion
  const handleSuggestion = useCallback(
    async (suggestion: string) => {
      setIsSubmitting(true)
      const optimisticId = `optimistic-${Date.now().toString()}`
      const optimisticMessage = {
        id: optimisticId,
        content: suggestion,
        role: "user" as const,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      try {
        const uid = await getOrCreateGuestUserId(user)

        if (!uid) {
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
          return
        }

        const allowed = await checkLimitsAndNotify(uid)
        if (!allowed) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
          return
        }

        const currentChatId = await ensureChatExists(uid, suggestion)

        if (!currentChatId) {
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
          return
        }

        prevChatIdRef.current = currentChatId

        const options = {
          body: {
            chatId: currentChatId,
            userId: uid,
            model: selectedModel,
            isAuthenticated,
            systemPrompt: SYSTEM_PROMPT_DEFAULT,
            localTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }

        append(
          {
            role: "user",
            content: suggestion,
          },
          options
        )
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      } catch {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        toast({ title: "Failed to send suggestion", status: "error" })
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      ensureChatExists,
      selectedModel,
      user,
      append,
      checkLimitsAndNotify,
      isAuthenticated,
      setMessages,
      setIsSubmitting,
    ]
  )

  // Handle reload
    const handleReload = useCallback(async () => {
      const uid = await getOrCreateGuestUserId(user)
      if (!uid) {
        return
      }

        const puterModels: string[] = []
        const isPuterModel = puterModels.includes(selectedModel)
        const puter = typeof window !== "undefined" ? (window as any).puter : null

          if (isPuterModel && puter) {
            const lastUserMessage = [...messages].reverse().find(m => m.role === "user")
            if (!lastUserMessage) return

            const messageGroupId = Date.now().toString()
            const assistantId = `assistant-reload-${Date.now().toString()}`
            const APP_DOMAIN = "https://chat.visora.my.id"
            
            // Remove existing assistant message if it's the last one
            const lastMessage = messages[messages.length - 1]
            if (lastMessage?.role === "assistant") {
              setMessages(prev => prev.slice(0, -1))
            }

            setMessages((prev) => [
              ...prev,
              {
                id: assistantId,
                content: "",
                role: "assistant",
                createdAt: new Date(),
              }
            ])

            try {
              const puterModelMap: Record<string, string> = {
                "grok-4": "x-ai/grok-4.1-fast",
                "grok-4-heavy": "x-ai/grok-4-heavy",
                "grok-2": "x-ai/grok-2",
                "claude-3-5-sonnet-latest": "claude-3-5-sonnet",
                "claude-4.5-sonnet": "claude-sonnet-4-5",
                "claude-4.5-opus": "claude-opus-4-5",
                "claude-opus-4.6": "claude-opus-4-6",
              }
              const puterModel = puterModelMap[selectedModel] || "gpt-4o"

              const firstImage = lastUserMessage.experimental_attachments?.find(a => a.contentType?.startsWith("image/"))
              let imageUrl = firstImage?.url
              if (imageUrl && imageUrl.startsWith("/")) {
                imageUrl = `${APP_DOMAIN}${imageUrl}`
              }

              let assistantContent = ""
              const options = { model: puterModel, stream: true }
              
              const modelInfo = getModelInfo(selectedModel)
              const modelName = modelInfo?.name || selectedModel
              const providerName = modelInfo?.provider || "AI"
              const personaPrompt = getPersonaPrompt(selectedModel, modelName, providerName)
              const finalUserContent = personaPrompt ? `${personaPrompt}\n\nUser: ${lastUserMessage.content}` : lastUserMessage.content

              let stream
              if (imageUrl) {
                stream = await puter.ai.chat(finalUserContent, imageUrl, options)
              } else {
                stream = await puter.ai.chat(finalUserContent, options)
              }

              for await (const part of stream) {
                if (part.type === 'text') {
                  const words = part.text.split(/(\s+)/);
                  for (const word of words) {
                    assistantContent += word;
                    setMessages((prev) => 
                      prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
                    );
                    if (word.trim().length > 0) {
                      await new Promise(resolve => setTimeout(resolve, 30));
                    }
                  }
                }
              }

              if (chatId) {
                await fetch("/api/chat/save", {
                  method: "POST",
                  body: JSON.stringify({
                    chatId,
                    userId: uid,
                    role: "assistant",
                    content: assistantContent,
                    model: selectedModel,
                    isAuthenticated,
                    message_group_id: messageGroupId,
                  })
                })
              }
            } catch (err) {
              console.error("Puter AI Reload Error:", err)
              toast({ title: `${selectedModel} (Puter.js) reload failed.`, status: "error" })
            }
            return
          }


      const options = {
        body: {
          chatId,
          userId: uid,
          model: selectedModel,
          isAuthenticated,
          systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
          localTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }

      reload(options)
    }, [user, chatId, selectedModel, isAuthenticated, systemPrompt, reload])

  // Handle input change - now with access to the real setInput function!
  const { setDraftValue } = useChatDraft(chatId)
  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value)
      setDraftValue(value)
    },
    [setInput, setDraftValue]
  )

  return {
    // Chat state
    messages,
    input,
    handleSubmit,
    status,
    error,
    reload,
    stop,
    setMessages,
    setInput,
    append,
    data,
    isAuthenticated,
    systemPrompt,
    hasSentFirstMessageRef,

    // Component state
    isSubmitting,
    setIsSubmitting,
    isDeploying,
    hasDialogAuth,
    setHasDialogAuth,
    enableSearch,
    setEnableSearch,

    // Actions
    submit,
    handleSuggestion,
    handleReload,
    handleInputChange,
    submitEdit,
  }
}
