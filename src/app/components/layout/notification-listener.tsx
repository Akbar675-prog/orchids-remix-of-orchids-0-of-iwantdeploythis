"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface NotificationData {
  id: string
  image_url: string
  description: string
  direct_url: string
  scheduled_for: string
}

export function NotificationListener() {
  const [activeNotif, setActiveNotif] = useState<NotificationData | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!supabase) return

    // 1. Fetch upcoming notifications that might have been missed or are about to happen
    const fetchUpcoming = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .gt("scheduled_for", new Date(Date.now() - 5000).toISOString()) // Within last 5s or future
        .order("scheduled_for", { ascending: true })
        .limit(5)

      if (data) {
        data.forEach(scheduleNotification)
      }
    }

    fetchUpcoming()

    // 2. Subscribe to new notifications
    const channel = supabase
      .channel("global-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          scheduleNotification(payload.new as NotificationData)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const scheduleNotification = (notif: NotificationData) => {
    const now = Date.now()
    const scheduledTime = new Date(notif.scheduled_for).getTime()
    const delay = scheduledTime - now

    if (delay <= 0) {
      // Show immediately if it was scheduled for the past (within a small window)
      if (Math.abs(delay) < 10000) { // 10s window
        showNotification(notif)
      }
    } else {
      setTimeout(() => {
        showNotification(notif)
      }, delay)
    }
  }

  const showNotification = async (notif: NotificationData) => {
    // 1. Try Native Notification if permitted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const title = "Visora Update"
        const options = {
          body: notif.description,
          icon: notif.image_url,
          badge: "/favicon.ico",
          data: { url: notif.direct_url },
          vibrate: [200, 100, 200],
          tag: notif.id,
          requireInteraction: true
        }

        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready
          if (reg) {
            await reg.showNotification(title, options)
          } else {
            new Notification(title, options)
          }
        } else {
          new Notification(title, options)
        }
      } catch (e) {
        console.error("Native notification failed", e)
      }
    }

    // 2. Always show in-app notification
    setActiveNotif(notif)
    
    // Play sound
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3")
      audio.play().catch(() => {})
    } catch (e) {}

    // Auto-hide in-app after 10s
    setTimeout(() => {
      setActiveNotif(prev => prev?.id === notif.id ? null : prev)
    }, 10000)
  }

  const handleNotifClick = () => {
    if (!activeNotif) return
    const url = activeNotif.direct_url
    setActiveNotif(null)
    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*")
    window.location.href = url
  }

  return (
    <AnimatePresence>
      {activeNotif && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: "-50%" }}
          animate={{ opacity: 1, y: 20, x: "-50%" }}
          exit={{ opacity: 0, y: -100, x: "-50%" }}
          className="fixed top-0 left-1/2 z-[9999] w-[90%] max-w-md"
        >
          <div 
            className="bg-card/95 border border-border shadow-2xl rounded-2xl overflow-hidden backdrop-blur-md cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={handleNotifClick}
          >
            <div className="p-4 flex gap-4">
              {activeNotif.image_url && (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                  <img src={activeNotif.image_url} alt="Notif" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-primary flex items-center gap-1">
                    <Bell className="w-3 h-3 fill-primary" />
                    Visora Global Update
                  </h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveNotif(null)
                    }}
                    className="p-1 hover:bg-muted rounded-full"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-sm text-foreground line-clamp-2 mt-1">
                  {activeNotif.description}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  Global Broadcast • Click to open
                  <ExternalLink className="w-2.5 h-2.5 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
