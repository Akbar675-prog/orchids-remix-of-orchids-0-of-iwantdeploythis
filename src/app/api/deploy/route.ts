import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const guestId = formData.get("guestId") as string
  const files = formData.getAll("files") as File[]

  if (!guestId || !files || files.length === 0) {
    return NextResponse.json(
      { error: "Missing guestId or files" },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500 }
    )
  }

  const results = []

    for (const file of files) {
      const filePath = `${guestId}/${file.name}`
      const { error } = await supabase.storage
      .from("deployments")
      .upload(filePath, file, {
        upsert: true,
      })

    if (error) {
      console.error(`Upload error for ${file.name}:`, error)
      continue
    }

    results.push({
      name: file.name,
      url: `/guest/deploy-app/${guestId}/${file.name}`,
    })
  }

  return NextResponse.json({ results })
}
