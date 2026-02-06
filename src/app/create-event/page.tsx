"use client"

import { useState, useEffect } from "react"
import { LayoutApp } from "@/app/components/layout/layout-app"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Bell, Clock, Link, Image as ImageIcon, MessageSquare, Plus, ExternalLink, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

export default function CreateEventPage() {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDJjEl--7Lj1aVsKFgWoc5qFSQ-NJ8qsAQ4EoXXsHhsPVqonhgwZ3AQF0&s=10",
    description: "New model DeepSeek R1 now added to our AI site! Click this notification to test it!",
    directUrl: "/deepseekr1",
    timing: "5s",
    customTime: "1",
    customUnit: "s",
  })

  const [isScheduling, setIsScheduling] = useState(false)

  // Register SW for reliable notifications
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then(reg => console.log("SW Registered", reg))
        .catch(err => console.error("SW Registration failed", err));
    }
  }, [])

    const handleCreateNotification = async () => {
      if (!supabase) {
        toast.error("Supabase tidak aktif.")
        return
      }

      setIsScheduling(true)

      let delayMs = 0
      if (formData.timing === "5s") delayMs = 5000
      else if (formData.timing === "5m") delayMs = 5 * 60 * 1000
      else if (formData.timing === "5h") delayMs = 5 * 60 * 60 * 1000
      else if (formData.timing === "custom") {
        const value = parseInt(formData.customTime) || 0
        if (formData.customUnit === "s") delayMs = value * 1000
        else if (formData.customUnit === "m") delayMs = value * 60 * 1000
        else if (formData.customUnit === "h") delayMs = value * 60 * 60 * 1000
      }

      // Minimum delay 100ms
      if (delayMs < 100) delayMs = 100

      const scheduledFor = new Date(Date.now() + delayMs).toISOString()

      try {
        // 1. Insert into Supabase (for Realtime listeners who are online)
        const { error } = await supabase.from("notifications").insert([
          {
            image_url: formData.imageUrl,
            description: formData.description,
            direct_url: formData.directUrl,
            scheduled_for: scheduledFor,
          },
        ])

        if (error) throw error

        // 2. Trigger Web Push API (for offline users)
        // If delay is small, we send it now. If large, we ideally want a cron.
        // For this demo, we'll trigger it immediately to show it works offline.
        await fetch("/api/notifications/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Visora Update",
            body: formData.description,
            image: formData.imageUrl,
            url: formData.directUrl,
          }),
        })

        toast.success(`Notifikasi Global berhasil dikirim ke semua subscriber!`)
      } catch (e) {
        console.error("Gagal menjadwalkan notifikasi global:", e)
        toast.error("Gagal menjadwalkan notifikasi global.")
      } finally {
        setIsScheduling(false)
      }
    }

  return (
    <LayoutApp>
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create Notification Event</h1>
              <p className="text-muted-foreground text-sm">Jadwalkan notifikasi kustom untuk semua orang</p>
            </div>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notification Details
              </CardTitle>
              <CardDescription>
                Notifikasi ini akan dikirim ke SEMUA orang, bahkan jika mereka sedang offline (jika sudah diaktifkan di Settings).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Photo URL
                </Label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-background/50 border-border/50 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Description
                </Label>
                <Textarea
                  placeholder="Masukkan deskripsi notifikasi..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-background/50 border-border/50 focus:ring-primary min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link className="w-3.5 h-3.5" />
                  Direct URL
                </Label>
                <Input
                  placeholder="/destination-page"
                  value={formData.directUrl}
                  onChange={(e) => setFormData({ ...formData, directUrl: e.target.value })}
                  className="bg-background/50 border-border/50 focus:ring-primary"
                />
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Waktu Notifikasi Muncul
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    value={formData.timing}
                    onValueChange={(value) => setFormData({ ...formData, timing: value })}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Pilih waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5s">5 Detik</SelectItem>
                      <SelectItem value="5m">5 Menit</SelectItem>
                      <SelectItem value="5h">5 Jam</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>

                  <AnimatePresence>
                    {formData.timing === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-2"
                      >
                        <Input
                          type="number"
                          value={formData.customTime}
                          onChange={(e) => setFormData({ ...formData, customTime: e.target.value })}
                          className="bg-background/50 border-border/50 w-24"
                          placeholder="Nilai"
                        />
                        <Select
                          value={formData.customUnit}
                          onValueChange={(value) => setFormData({ ...formData, customUnit: value })}
                        >
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="s">Detik</SelectItem>
                            <SelectItem value="m">Menit</SelectItem>
                            <SelectItem value="h">Jam</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <Button
                onClick={handleCreateNotification}
                disabled={isScheduling}
                className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                {isScheduling ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-background/30 border-t-background animate-spin rounded-full" />
                    Sending Global Push...
                  </div>
                ) : (
                  "Create Notification"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </LayoutApp>
  )
}
