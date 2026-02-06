import { isSupabaseEnabled } from "@/lib/supabase/config"
import { notFound, redirect } from "next/navigation"

export default function AuthPage() {
  if (!isSupabaseEnabled) {
    return notFound()
  }

  redirect("/auth/login")
}
