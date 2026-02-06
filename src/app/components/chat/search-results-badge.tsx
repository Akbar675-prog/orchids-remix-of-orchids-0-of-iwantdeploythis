"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import { useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Link, ArrowSquareOut } from "@phosphor-icons/react"
import { getFavicon, formatUrl, addUTM } from "./utils"

export interface SearchResult {
  title: string
  link: string
  snippet: string
}

interface SearchResultsBadgeProps {
  results: SearchResult[]
  className?: string
}

export function SearchResultsBadge({ results, className }: SearchResultsBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [failedFavicons, setFailedFavicons] = useState<Set<string>>(new Set())

  const handleFaviconError = (url: string) => {
    setFailedFavicons((prev) => new Set(prev).add(url))
  }

  if (!results || results.length === 0) return null

  const uniqueDomains = [...new Set(results.map(r => {
    try {
      return new URL(r.link).hostname
    } catch {
      return r.link
    }
  }))]

  const displayedFavicons = results.slice(0, 4)

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit",
          "bg-muted/50 hover:bg-muted border border-border/50",
          "transition-all duration-200 cursor-pointer",
          "text-sm text-muted-foreground hover:text-foreground",
          className
        )}
      >
        <div className="flex -space-x-1.5">
          {displayedFavicons.map((result, index) => {
            const faviconUrl = getFavicon(result.link)
            const showFallback = !faviconUrl || failedFavicons.has(result.link)

            return showFallback ? (
              <div
                key={`favicon-${index}`}
                className="w-5 h-5 rounded-full bg-muted-foreground/20 border-2 border-background flex items-center justify-center"
              >
                <Link className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            ) : (
              <Image
                key={`favicon-${index}`}
                src={faviconUrl}
                alt={`Favicon`}
                width={20}
                height={20}
                className="w-5 h-5 rounded-full border-2 border-background object-cover"
                onError={() => handleFaviconError(result.link)}
              />
            )
          })}
        </div>
        <span className="font-medium">{results.length} halaman web</span>
      </motion.button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col">
            <DrawerHeader className="border-b border-border/50">
              <DrawerTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                {results.length} Sumber Web
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto flex-1 p-4">
              <ul className="space-y-3">
                {results.map((result, index) => {
                  const faviconUrl = getFavicon(result.link)
                  const showFallback = !faviconUrl || failedFavicons.has(result.link)

                  return (
                    <motion.li
                      key={`result-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <a
                        href={addUTM(result.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {showFallback ? (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <Link className="w-3 h-3 text-muted-foreground" />
                              </div>
                            ) : (
                              <Image
                                src={faviconUrl}
                                alt={`Favicon`}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full object-cover"
                                onError={() => handleFaviconError(result.link)}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {result.title}
                              </h4>
                              <ArrowSquareOut className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {formatUrl(result.link)}
                            </p>
                            <p className="text-sm text-muted-foreground/80 mt-1.5 line-clamp-2">
                              {result.snippet}
                            </p>
                          </div>
                        </div>
                      </a>
                    </motion.li>
                  )
                })}
              </ul>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
