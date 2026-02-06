"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export const dynamic = "force-dynamic"

function EventsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const deepseekEvents = searchParams.get("deepseekr1events")

    if (deepseekEvents === "true") {
      localStorage.setItem("visora-model-override", "deepseek-r1")
      router.push("/")
    } else {
      router.push("/")
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground animate-pulse text-sm">
          Processing event...
        </p>
      </div>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    }>
      <EventsContent />
    </Suspense>
  )
}
