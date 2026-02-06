"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { APP_NAME } from "@/lib/config"

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("visora_welcome_seen")
    if (!hasSeenWelcome) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem("visora_welcome_seen", "true")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="[&>button:last-child]:bg-background gap-0 overflow-hidden rounded-3xl p-0 shadow-xs sm:max-w-md [&>button:last-child]:rounded-full [&>button:last-child]:p-1">
        <DialogHeader className="p-0">
            <Image
              src="/visora_banner.png"
              alt={`${APP_NAME} Banner`}
            width={400}
            height={128}
            className="h-32 w-full object-cover"
          />
          <DialogTitle className="hidden">Selamat Datang di {APP_NAME}</DialogTitle>
          <DialogDescription className="hidden">
            Informasi mengenai penggunaan cookie dan ucapan selamat datang di {APP_NAME}.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Selamat datang di {APP_NAME}!
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Kami senang Anda di sini. {APP_NAME} adalah platform utama Visora Labs—antarmuka AI modern yang dirancang untuk membantu Anda berpikir lebih jernih dan bekerja lebih efisien.
              </p>
            </div>
          
          <div className="bg-muted/50 rounded-2xl p-4 text-xs space-y-2 border border-border/50">
            <p className="font-semibold text-foreground flex items-center gap-2">
              Kebijakan Cookie
            </p>
            <p className="text-muted-foreground leading-normal">
              Kami menggunakan cookie untuk meningkatkan pengalaman Anda, menganalisis lalu lintas situs, dan menyimpan preferensi Anda agar interaksi chat tetap mulus. Dengan melanjutkan, Anda menyetujui penggunaan cookie kami.
            </p>
          </div>
          
          <Button onClick={handleClose} className="w-full rounded-full font-medium h-10">
            Saya Mengerti
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
