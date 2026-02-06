import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { nanoid } from "nanoid"

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase not available" }, { status: 500 })

    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase
      .from("app_api_keys")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/app-keys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase not available" }, { status: 500 })

    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Format: vsk_[random]
    const key = `vsk_${nanoid(24)}`

    const { data, error } = await supabase
      .from("app_api_keys")
      .insert({
        user_id: authData.user.id,
        key,
        name: name || "Default Key",
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/app-keys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase not available" }, { status: 500 })

    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { error } = await supabase
      .from("app_api_keys")
      .delete()
      .eq("id", id)
      .eq("user_id", authData.user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/app-keys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
