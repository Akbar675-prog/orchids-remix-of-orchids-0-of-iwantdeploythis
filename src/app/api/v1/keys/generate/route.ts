import { createGuestServerClient } from "@/lib/supabase/server-guest"
import { nanoid } from "nanoid"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createGuestServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not available" }, { status: 500 })
    }

    const userId = crypto.randomUUID()
    const email = `sdk-${nanoid(10)}@visora.anonymous`

    // 1. Create anonymous user
    const { error: userError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        anonymous: true,
        message_count: 0,
        premium: false,
      })

    if (userError) {
      console.error("SDK Key Gen - User Error:", userError)
      return NextResponse.json({ error: "Failed to create SDK session" }, { status: 500 })
    }

    // 2. Generate API Key
    const key = `vsk_${nanoid(24)}`
    const { data: keyData, error: keyError } = await supabase
      .from("app_api_keys")
      .insert({
        user_id: userId,
        key,
        name: "SDK Random Key",
      })
      .select("key")
      .single()

    if (keyError) {
      console.error("SDK Key Gen - Key Error:", keyError)
      return NextResponse.json({ error: "Failed to generate SDK key" }, { status: 500 })
    }

    return NextResponse.json({ 
      apiKey: keyData.key,
      userId,
      message: "This key is temporary and for SDK use only."
    })
  } catch (error) {
    console.error("Error in SDK key generation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
