import fs from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface SerperResult {
  title: string
  link: string
  snippet: string
}

export interface SearchResponse {
  results: SerperResult[]
  conclusion: string
}

async function searchWithSearch1API(query: string): Promise<SerperResult[]> {
  try {
    const response = await fetch("https://api.search1api.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        search_service: "google",
        max_results: 10,
      }),
    })

    if (!response.ok) {
      console.error(`Search1API error: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    // Search1API returns results in a 'results' or similar field depending on the service
    // Based on common patterns for this API:
    const searchResults = data.results || data || []
    
    return (Array.isArray(searchResults) ? searchResults : []).map((result: any) => ({
      title: result.title || result.name || "No Title",
      link: result.link || result.url || result.href || "",
      snippet: result.snippet || result.description || result.content || "",
    })).filter(r => r.link)
  } catch (error) {
    console.error("Error searching with Search1API:", error)
    return []
  }
}

async function searchWithSerper(query: string): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) return []

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 10 }),
    })

    if (!response.ok) return []

    const data = await response.json()
    return (data.organic || []).map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
    }))
  } catch (error) {
    console.error("Error searching with Serper:", error)
    return []
  }
}

async function searchWithDuckDuckGo(query: string): Promise<SerperResult[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    const response = await fetch(url)
    if (!response.ok) return []

    const data = await response.json()
    const results: SerperResult[] = []

    if (data.AbstractText) {
      results.push({
        title: data.Heading || "DuckDuckGo Abstract",
        link: data.AbstractURL || "",
        snippet: data.AbstractText,
      })
    }

    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(" - ")[0] || "Related Topic",
            link: topic.FirstURL,
            snippet: topic.Text,
          })
        }
      })
    }

    return results.filter(r => r.link)
  } catch (error) {
    console.error("Error searching with DuckDuckGo:", error)
    return []
  }
}

export async function searchWithSerperOnly(query: string): Promise<SearchResponse> {
  try {
    const results = await searchWithSerper(query)
    
    let conclusion = results.length > 0 
      ? `Ditemukan ${results.length} hasil relevan menggunakan Serper untuk "${query}".`
      : "Tidak ditemukan hasil pencarian yang relevan menggunakan Serper."

    if (results.length > 0) {
      const content = results.slice(0, 5).map((r: any) => r.snippet).join("\n\n")
      try {
        const { text } = await generateText({
          model: groq("llama-3-8b-8192"),
          prompt: `Berikan kesimpulan yang sangat rapi dan informatif (3-4 kalimat) dalam bahasa Indonesia berdasarkan hasil pencarian berikut untuk query: "${query}"\n\n${content}\n\nFormat dengan markdown: gunakan bold untuk poin penting dan tambahkan 1-2 emoji yang relevan. Jangan gunakan kata-kata pembuka seperti "Berdasarkan hasil pencarian...". Langsung ke intinya.`,
        })
        conclusion = text.trim()
      } catch (aiError) {
        console.error("Failed to generate search conclusion:", aiError)
      }
    }

    return { results, conclusion }
  } catch (error) {
    console.error("Error in searchWithSerperOnly:", error)
    return { results: [], conclusion: "Terjadi kesalahan saat melakukan pencarian dengan Serper." }
  }
}

export async function searchGoogle(query: string): Promise<SearchResponse> {

  try {
    // Primary: Search1API (Keyless, Free)
    let results = await searchWithSearch1API(query)
    
    // Secondary: DuckDuckGo (Keyless, Unlimited)
    if (results.length === 0) {
      results = await searchWithDuckDuckGo(query)
    }

    // Fallback: Serper (if key exists)
    if (results.length === 0) {
      results = await searchWithSerper(query)
    }

    // Generate conclusion using AI
    let conclusion = results.length > 0 
      ? `Ditemukan ${results.length} hasil relevan untuk "${query}".`
      : "Tidak ditemukan hasil pencarian yang relevan."

    if (results.length > 0) {
      const content = results.slice(0, 5).map((r: any) => r.snippet).join("\n\n")
      try {
        const { text } = await generateText({
          model: groq("llama-3-8b-8192"),
          prompt: `Berikan kesimpulan yang sangat rapi dan informatif (3-4 kalimat) dalam bahasa Indonesia berdasarkan hasil pencarian berikut untuk query: "${query}"\n\n${content}\n\nFormat dengan markdown: gunakan bold untuk poin penting dan tambahkan 1-2 emoji yang relevan. Jangan gunakan kata-kata pembuka seperti "Berdasarkan hasil pencarian...". Langsung ke intinya.`,
        })
        conclusion = text.trim()
      } catch (aiError) {
        console.error("Failed to generate search conclusion:", aiError)
      }
    }

    return { results, conclusion }
  } catch (error) {
    console.error("Error in searchGoogle:", error)
    return { results: [], conclusion: "Terjadi kesalahan saat melakukan pencarian." }
  }
}
