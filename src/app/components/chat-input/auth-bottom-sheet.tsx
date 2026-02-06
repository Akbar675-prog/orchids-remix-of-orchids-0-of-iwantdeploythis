"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import GithubIcon from "@/components/icons/github"
import GoogleIcon from "@/components/icons/google"
import { signInWithGithub, signInWithGoogle } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { useState } from "react"

interface AuthBottomSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthBottomSheet({ isOpen, onClose }: AuthBottomSheetProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isSupabaseEnabled) {
    return null
  }

  const handleSignIn = async (provider: "google" | "github") => {
    const supabase = createClient()
    if (!supabase) return

    try {
      setIsLoading(provider)
      setError(null)

      const data =
        provider === "google"
          ? await signInWithGoogle(supabase)
          : await signInWithGithub(supabase)

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: unknown) {
      console.error(`Error signing in with ${provider}:`, err)
      setError(
        (err as Error).message ||
          "An unexpected error occurred. Please try again."
      )
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="pb-8">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-2xl font-bold">Login required</DrawerTitle>
            <DrawerDescription className="text-muted-foreground text-base">
              Please login to use the search feature and explore more capabilities.
            </DrawerDescription>
          </DrawerHeader>

          {error && (
            <div className="bg-destructive/10 text-destructive mx-4 mb-4 rounded-lg p-3 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 px-4 py-2">
            <Button
              variant="outline"
              size="lg"
              className="h-12 border-border/50 hover:bg-secondary/50"
              onClick={() => handleSignIn("google")}
              disabled={!!isLoading}
            >
              <GoogleIcon className="mr-2 size-5" />
              <span>{isLoading === "google" ? "..." : "Google"}</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 border-border/50 hover:bg-secondary/50"
              onClick={() => handleSignIn("github")}
              disabled={!!isLoading}
            >
              <GithubIcon className="mr-2 size-5" />
              <span>{isLoading === "github" ? "..." : "GitHub"}</span>
            </Button>
          </div>

          <DrawerFooter className="mt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
