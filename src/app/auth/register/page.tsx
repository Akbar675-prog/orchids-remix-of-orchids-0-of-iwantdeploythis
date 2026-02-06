"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { HeaderGoBack } from "../../components/header-go-back"
import Link from "next/link"
import GoogleIcon from "@/components/icons/google"
import GithubIcon from "@/components/icons/github"
import FacebookIcon from "@/components/icons/facebook"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState<"google" | "github" | "facebook" | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleOAuthSignUp(provider: "google" | "github" | "facebook") {
    try {
      setIsLoading(provider)
      setError(null)
      
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

        if (error) {
          setError(error.message)
          setIsLoading(null)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred."
        setError(message)
        setIsLoading(null)
      }
    }

  return (
    <div className="bg-background flex h-dvh w-full flex-col">
      <HeaderGoBack href="/" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
              Create Account
            </h1>
            <p className="text-muted-foreground mt-3">
              Join Visora and start chatting with AI
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 px-2"
                  onClick={() => handleOAuthSignUp("google")}
                  disabled={isLoading !== null}
                >
                  <GoogleIcon className="mr-2 size-4" />
                  {isLoading === "google" ? "..." : "Google"}
                </Button>

                <Button
                  variant="secondary"
                  className="flex-1 px-2"
                  onClick={() => handleOAuthSignUp("github")}
                  disabled={isLoading !== null}
                >
                  <GithubIcon className="mr-2 size-4" />
                  {isLoading === "github" ? "..." : "GitHub"}
                </Button>

                <Button
                  variant="secondary"
                  className="flex-1 px-2"
                  onClick={() => handleOAuthSignUp("facebook")}
                  disabled={isLoading !== null}
                >
                  <FacebookIcon className="mr-2 size-4" />
                  {isLoading === "facebook" ? "..." : "Facebook"}
                </Button>
              </div>

          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <footer className="text-muted-foreground py-6 text-center text-sm">
        <p>
          By continuing, you agree to our{" "}
          <Link href="/" className="text-foreground hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/" className="text-foreground hover:underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  )
}
