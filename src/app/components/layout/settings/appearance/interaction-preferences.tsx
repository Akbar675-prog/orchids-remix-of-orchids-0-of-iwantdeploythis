"use client"

import { Switch } from "@/components/ui/switch"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useUser } from "@/lib/user-store/provider"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function InteractionPreferences() {
  const { user } = useUser()
  const {
    preferences,
    setPromptSuggestions,
    setShowToolInvocations,
    setShowConversationPreviews,
    setMultiModelEnabled,
    setReceiveNotifications,
  } = useUserPreferences()

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      setReceiveNotifications(enabled)

      if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
        console.warn("Notifications or Service Worker not supported")
        return
      }

      if (enabled) {
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
          // Register service worker if not already
          const registration = await navigator.serviceWorker.ready

          // Subscribe to push
          const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
          }

          const subscription = await registration.pushManager.subscribe(subscribeOptions)

          // Send subscription to server
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscription,
              userId: user?.id,
            }),
          })

          // Optional: Initial welcome notification
          new Notification("Visora Notifications Active", {
            body: "You will now receive global notifications even when the browser is closed.",
            icon: "/icon-192x192.png",
          })
        }
      } else {
        // Unsubscribe from push
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          
          // Remove from server
          await fetch("/api/push/unsubscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
            }),
          })
        }
      }
    } catch (error) {
      console.error("Error toggling notifications:", error)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Receive Notifications */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">
              Receive global push notifications
            </h3>
            <p className="text-muted-foreground text-xs">
              Stay updated even when Visora is closed
            </p>
          </div>
          <Switch
            checked={preferences.receiveNotifications}
            onCheckedChange={handleNotificationToggle}
          />
        </div>
      </div>
      {/* Prompt Suggestions */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Prompt suggestions</h3>
            <p className="text-muted-foreground text-xs">
              Show suggested prompts when starting a new conversation
            </p>
          </div>
          <Switch
            checked={preferences.promptSuggestions}
            onCheckedChange={setPromptSuggestions}
          />
        </div>
      </div>
      {/* Tool Invocations */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Tool invocations</h3>
            <p className="text-muted-foreground text-xs">
              Show tool execution details in conversations
            </p>
          </div>
          <Switch
            checked={preferences.showToolInvocations}
            onCheckedChange={setShowToolInvocations}
          />
        </div>
      </div>
      {/* Conversation Previews */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Conversation previews</h3>
            <p className="text-muted-foreground text-xs">
              Show conversation previews in history
            </p>
          </div>
          <Switch
            checked={preferences.showConversationPreviews}
            onCheckedChange={setShowConversationPreviews}
          />
        </div>
      </div>
      {/* Multi-Model Chat */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Multi-model chat</h3>
            <p className="text-muted-foreground text-xs">
              Send prompts to multiple models at once
            </p>
          </div>
          <Switch
            checked={preferences.multiModelEnabled}
            onCheckedChange={setMultiModelEnabled}
          />
        </div>
      </div>
    </div>
  )
}
