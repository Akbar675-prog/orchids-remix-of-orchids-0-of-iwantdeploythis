import { validateApiKey } from "@/lib/server/api-key-validation"
import { searchWithSerperOnly } from "@/lib/server/serper"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization")
    const apiKey = authHeader?.replace("Bearer ", "")

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }, null, 2), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    const userId = await validateApiKey(apiKey)
    if (!userId) {
      return new Response(JSON.stringify({ error: "Invalid API Key" }, null, 2), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    const { query } = await req.json()

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }, null, 2), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    const { results, conclusion } = await searchWithSerperOnly(query)
    return new Response(
      JSON.stringify(
        {
          conclusion,
          results: results.slice(0, 10),
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Error in public search API:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
