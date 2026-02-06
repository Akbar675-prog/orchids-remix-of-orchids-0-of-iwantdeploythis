import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (error || !data.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const metadata = data.user.user_metadata || {}

  return NextResponse.json({
    id: data.user.id,
    email: data.user.email,
    display_name: metadata.full_name || metadata.name || data.user.email?.split("@")[0] || "User",
    profile_image: metadata.avatar_url || metadata.picture || "",
  })
}
