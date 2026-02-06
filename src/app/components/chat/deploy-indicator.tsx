"use client"

import { ShinyText } from "@/components/ui/shiny-text"

export function DeployIndicator() {
  return (
    <div className="flex items-center gap-2 px-6 py-2">
      <ShinyText 
        text="Mengerjakan..."
        className="text-sm font-medium"
      />
    </div>
  )
}
