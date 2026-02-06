import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string; filename: string }> }
) {
  const { guestId, filename } = await params
  const supabase = await createClient()

  if (!supabase) {
    return new NextResponse("Supabase is not configured", { status: 500 })
  }

  const { data, error } = await supabase.storage
    .from("deployments")
    .download(`${guestId}/${filename}`)

  if (error || !data) {
    return new NextResponse("File not found", { status: 404 })
  }

  const contentType =
    data.type || "application/octet-stream"

  return new NextResponse(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
