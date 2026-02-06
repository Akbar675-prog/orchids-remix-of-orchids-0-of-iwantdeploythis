"use client"

import { ShinyText } from "@/components/ui/shiny-text"

interface SearchIndicatorProps {
  query: string
}

export function SearchIndicator({ query }: SearchIndicatorProps) {
  return (
    <div className="relative inline-block my-2">
        <ShinyText 
          text={`Mencari ${query}...`}
          className="text-base font-medium"
        />
    </div>
  )
}
