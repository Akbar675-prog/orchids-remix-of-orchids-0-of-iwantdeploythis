"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { signInWithGoogle } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import GoogleIcon from "@/components/icons/google"
import GithubIcon from "@/components/icons/github"
import FacebookIcon from "@/components/icons/facebook"
import { useState } from "react"

type DialogAuthProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export function DialogAuth({ open, setOpen }: DialogAuthProps) {
  const [isLoading, setIsLoading] = useState<"google" | "github" | "facebook" | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isSupabaseEnabled) {
    return null
  }

  const supabase = createClient()

  if (!supabase) {
    return null
  }

  const handleOAuthSignIn = async (provider: "google" | "github" | "facebook") => {
    try {
      setIsLoading(provider)
      setError(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: unknown) {
      console.error(`Error signing in with ${provider}:`, err)
      setError(
        (err as Error).message ||
          "An unexpected error occurred. Please try again."
      )
      setIsLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            You&apos;ve reached the limit for today
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Sign in below to increase your message limits.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="secondary"
            className="w-full text-base"
            size="lg"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading !== null}
          >
            <GoogleIcon className="mr-2 size-4" />
            <span>{isLoading === "google" ? "Connecting..." : "Continue with Google"}</span>
          </Button>

          <Button
            variant="secondary"
            className="w-full text-base"
            size="lg"
            onClick={() => handleOAuthSignIn("facebook")}
            disabled={isLoading !== null}
          >
            <FacebookIcon className="mr-2 size-4" />
            <span>{isLoading === "facebook" ? "Connecting..." : "Continue with Facebook"}</span>
          </Button>

          <Button
            variant="secondary"
            className="w-full text-base"
            size="lg"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isLoading !== null}
          >
            <GithubIcon className="mr-2 size-4" />
            <span>{isLoading === "github" ? "Connecting..." : "Continue with GitHub"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
