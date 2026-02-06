import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LayoutApp } from "@/app/components/layout/layout-app"
import { GlobalChatContainer } from "./global-chat-container"

export default async function Page({ params }: { params: Promise<{ channel: string }> }) {
  const { channel } = await params
  const supabase = await createClient()
  if (!supabase) return redirect("/auth")

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect("/auth")

  // Get profile from auth metadata (Google/GitHub OAuth)
  const metadata = user.user_metadata || {}
  const displayName = metadata.full_name || metadata.name || user.email?.split("@")[0] || "User"
  const profileImage = metadata.avatar_url || metadata.picture || ""

  // Validate channel
  if (!['Global', 'ID', 'US'].includes(channel)) {
    return redirect("/Chat/Global")
  }

  return (
    <LayoutApp>
      <GlobalChatContainer 
        channel={channel} 
        user={{
          id: user.id,
          email: user.email || "",
          profile_image: profileImage,
          display_name: displayName
        }} 
      />
    </LayoutApp>
  )
}
