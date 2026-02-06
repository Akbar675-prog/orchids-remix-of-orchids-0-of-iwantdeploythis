"use client"

import { MessageContent } from "@/components/prompt-kit/message"
import { cn } from "@/lib/utils"
import { Info, RocketLaunch } from "@phosphor-icons/react"

export function SystemNotification({ content }: { content: string }) {
  const match = content.match(/^\[System Notification:\s*(.*?)\]/)
  const title = match ? match[1] : "System Notification"
  const messageBody = match ? content.slice(match[0].length).trim() : content

  const isSuccess =
    title.toLowerCase().includes("success") ||
    title.toLowerCase().includes("deployed")

  return (
    <div
      className={cn(
        "my-4 rounded-2xl border p-5 transition-all duration-500",
        isSuccess
          ? "border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)] dark:border-emerald-400/20 dark:bg-emerald-400/5"
          : "border-blue-500/20 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.05)] dark:border-blue-400/20 dark:bg-blue-400/5"
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center gap-3",
          isSuccess
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-blue-600 dark:text-blue-400"
        )}
      >
        <div
          className={cn(
            "rounded-lg p-2",
            isSuccess ? "bg-emerald-500/10" : "bg-blue-500/10"
          )}
        >
          {isSuccess ? (
            <RocketLaunch size={24} weight="fill" />
          ) : (
            <Info size={24} weight="fill" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
            System Notification
          </span>
          <span className="text-base font-bold leading-none">{title}</span>
        </div>
      </div>
      <div className="relative">
        <MessageContent
          className={cn(
            "prose dark:prose-invert prose-sm relative min-w-full bg-transparent p-0 text-foreground/90",
            "prose-p:my-1 prose-ul:my-2 prose-li:my-0",
            "prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline"
          )}
          markdown={true}
        >
          {messageBody}
        </MessageContent>
      </div>
    </div>
  )
}
