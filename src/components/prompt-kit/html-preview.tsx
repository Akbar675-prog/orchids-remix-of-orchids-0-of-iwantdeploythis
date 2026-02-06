"use client"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye } from "@phosphor-icons/react"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface HtmlPreviewProps {
  code: string
}

export function HtmlPreview({ code }: HtmlPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const PreviewContent = (
    <div className="flex-1 overflow-auto p-4 bg-white">
      <iframe
        srcDoc={code}
        className="w-full h-full border-none min-h-[500px]"
        title="HTML Preview"
        sandbox="allow-popups allow-modals allow-scripts"
      />
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex h-6 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors"
        title="View HTML"
      >
        <Eye className="size-3.5" />
        <span>View</span>
      </button>

      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="h-[85vh] max-h-[85vh]">
            <div className="mx-auto w-full max-w-5xl h-full flex flex-col">
              <DrawerHeader className="border-b">
                <DrawerTitle>HTML Preview</DrawerTitle>
              </DrawerHeader>
              {PreviewContent}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-[90vw] w-[1200px] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="px-6 py-4 border-b shrink-0 bg-background">
              <DialogTitle>HTML Preview</DialogTitle>
            </DialogHeader>
            {PreviewContent}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
