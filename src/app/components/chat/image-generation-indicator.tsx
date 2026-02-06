"use client"

import { Image as ImageIcon, DownloadSimple, ShareNetwork, Eye, X } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageGenerationIndicatorProps {
  prompt: string
  isComplete?: boolean
  imageId?: string
}

export function ImageGenerationIndicator({ prompt, isComplete, imageId }: ImageGenerationIndicatorProps) {
  const [showModal, setShowModal] = useState(false)
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?style=realistic&size=1024x1024&nologo=true`
  const imageUrl = imageId ? `/api/images/${imageId}` : pollinationsUrl
  const thumbnailUrL = imageId ? `/api/images/${imageId}` : `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?style=realistic&size=512x512&nologo=true`

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `visora-${prompt.slice(0, 20)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Gambar berhasil diunduh")
    } catch (error) {
      toast.error("Gagal mengunduh gambar")
    }
  }, [imageUrl, prompt])

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(imageUrl)
    toast.success("Link gambar disalin ke clipboard")
  }, [imageUrl])

  return (
    <div className="flex flex-col gap-4 my-4">
      <AnimatePresence mode="wait">
        {!isComplete ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full aspect-square max-w-[400px] rounded-[2rem] bg-muted/10 border border-primary/5 overflow-hidden flex items-center justify-center shadow-2xl"
            >
              {/* Pulsing Shiny Box */}
              <motion.div
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-primary/20 to-primary/10"
              />
              
              {/* Shimmer line */}
              <motion.div
                animate={{
                  left: ["-150%", "150%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />

              {/* Glowing center */}
              <motion.div
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-32 h-32 bg-primary/20 rounded-full blur-3xl"
              />
            </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative w-full max-w-[512px] aspect-square rounded-3xl overflow-hidden border border-primary/10 shadow-xl cursor-pointer bg-muted/10"
            onClick={() => setShowModal(true)}
          >
            <img
              src={thumbnailUrL}
              alt={prompt}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/10 border border-white/20 p-4 rounded-full backdrop-blur-md shadow-2xl"
              >
                <Eye className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            {/* Prompt label on hover */}
            <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-white text-xs font-medium truncate">
                {prompt}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Popup */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={() => setShowModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[512px] bg-card/40 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col items-center p-6 gap-6"
            >
              {/* Image Container */}
              <div className="w-full aspect-square bg-muted/20 rounded-[2.5rem] overflow-hidden border border-white/5 relative group">
                <img
                  src={imageUrl}
                  alt={prompt}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="w-full flex flex-col gap-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(imageUrl, "_blank")}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-foreground font-bold transition-all active:scale-[0.98] border border-white/5 backdrop-blur-md"
                  >
                    <Eye size={20} weight="bold" />
                    Lihat
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                  >
                    <DownloadSimple size={20} weight="bold" />
                    Install
                  </button>
                </div>
                
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground font-bold transition-all active:scale-[0.98] border border-white/5"
                >
                  <ShareNetwork size={20} weight="bold" />
                  Bagikan Link
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
