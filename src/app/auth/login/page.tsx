"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { HeaderGoBack } from "../../components/header-go-back"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import GoogleIcon from "@/components/icons/google"
import GithubIcon from "@/components/icons/github"
import FacebookIcon from "@/components/icons/facebook"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [isEmailSent, setIsEmailSent] = useState(false)
    const supabase = createClient()
  
    async function handleOAuthSignIn(provider: "google" | "github" | "facebook") {
      if (!supabase) return
      try {
        setIsLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred."
        setError(message)
        setIsLoading(false)
      }
    }
  
    async function handleEmailSignIn(e: React.FormEvent) {
      e.preventDefault()
      if (!supabase) return
  
      try {
        setIsLoading(true)
        setError(null)
        
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
  
        if (error) throw error
        setIsEmailSent(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start sign in."
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

  return (
    <div className="bg-background flex h-dvh w-full flex-col">
      <HeaderGoBack href="/" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
              {isEmailSent ? "Check your email" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground mt-3">
              {isEmailSent 
                ? `We've sent a temporary login link to ${email}` 
                : "Sign in to your Visora account"}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {!isEmailSent ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleOAuthSignIn("google")}
                        disabled={isLoading}
                      >
                        <GoogleIcon className="mr-2 size-4" />
                        <span>Google</span>
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleOAuthSignIn("github")}
                        disabled={isLoading}
                      >
                        <GithubIcon className="mr-2 size-4" />
                        <span>GitHub</span>
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleOAuthSignIn("facebook")}
                        disabled={isLoading}
                      >
                        <FacebookIcon className="mr-2 size-4" />
                        <span>Facebook</span>
                      </Button>
                  </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted/50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending link..." : "Continue with Email"}
                  </Button>
                </form>
              </>
            ) : (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setIsEmailSent(false)}
                disabled={isLoading}
              >
                Back to Sign In
              </Button>
            )}
          </div>

          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-foreground font-medium hover:underline">
              Create an account
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
