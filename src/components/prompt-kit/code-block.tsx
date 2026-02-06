"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import React, { useDeferredValue, useEffect, useRef, useState } from "react"
import { codeToHtml } from "shiki"

export type CodeBlockProps = {
  children?: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border",
        "border-border bg-card text-card-foreground rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type CodeBlockCodeProps = {
  code: string
  language?: string
  theme?: string
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlockCode({
  code,
  language = "tsx",
  className,
  ...props
}: CodeBlockCodeProps) {
  const { resolvedTheme: appTheme } = useTheme()
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)
  const deferredCode = useDeferredValue(code)
  const lastHighlightedCode = useRef<string>("")
  const isHighlighting = useRef<boolean>(false)

  useEffect(() => {
    // Skip if code is same as last highlighted to avoid redundant work
    if (deferredCode === lastHighlightedCode.current || isHighlighting.current) return

    async function highlight() {
      isHighlighting.current = true
      try {
        const html = await codeToHtml(deferredCode, {
          lang: language,
          theme: appTheme === "dark" ? "vitesse-dark" : "vitesse-light",
        })
        setHighlightedHtml(html)
        lastHighlightedCode.current = deferredCode
      } catch (err) {
        console.error("Shiki error:", err)
      } finally {
        isHighlighting.current = false
      }
    }

    // Debounce the highlight slightly during streaming
    const timeout = setTimeout(highlight, 100)
    return () => clearTimeout(timeout)
  }, [deferredCode, language, appTheme])

  const classNames = cn(
    "w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4",
    className
  )

  // Use plain text if we don't have highlighted HTML yet, OR if the code has changed 
  // but highlighting hasn't caught up yet (to keep UI responsive)
  const shouldShowPlain = !highlightedHtml || code !== lastHighlightedCode.current

  return shouldShowPlain ? (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  ) : (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  )
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock }
