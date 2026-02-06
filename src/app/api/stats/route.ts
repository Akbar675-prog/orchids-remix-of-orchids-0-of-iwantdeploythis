import { createGuestServerClient } from "@/lib/supabase/server-guest"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createGuestServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not available" }, { status: 500 })
    }

    // 1. Fetch User Trend (last 20 days)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })

    // 2. Fetch API Usage Trend (actual logs - last 20 days)
    const { data: usageData, error: usageError } = await supabase
      .from("api_usage_logs")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })

    // 3. Fetch Total Stats
    const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })
    const { count: totalKeys } = await supabase.from("app_api_keys").select("*", { count: "exact", head: true })
    const { count: totalLogs } = await supabase.from("api_usage_logs").select("*", { count: "exact", head: true })

    // 4. Calculate Real-time Rate (last 1 hour)
    const { data: recentLogs } = await supabase
      .from("api_usage_logs")
      .select("id, created_at")
      .gte("created_at", new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })

    const lastLogTime = recentLogs?.[0]?.created_at || null

    if (userError || usageError) {
      console.error("Stats API Error:", userError || usageError)
    }

    // Process data into daily buckets
    const days = 20
    const labels: string[] = []
    const userTrend: number[] = Array(days).fill(0)
    const usageTrend: number[] = Array(days).fill(0)

    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (days - 1 - i))
      const dateStr = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
      labels.push(dateStr)

      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime()
      const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime()

      if (userData) {
        userTrend[i] = userData.filter(u => {
          const t = new Date(u.created_at).getTime()
          return t >= dayStart && t <= dayEnd
        }).length
      }

      if (usageData) {
        usageTrend[i] = usageData.filter(c => {
          const t = new Date(c.created_at).getTime()
          return t >= dayStart && t <= dayEnd
        }).length
      }
    }

    // Add some "life" to the RAM and CPU
    const cpu = Math.floor(Math.random() * 5 + 15) // 15-20% base
    const memUsed = 84.2 + Math.sin(Date.now() / 10000) * 2 + Math.random() // ~84GB used
    const memTotal = 256 // Adjusted to 256GB for "AI Supercluster" feel
    const memFree = Number((memTotal - memUsed).toFixed(1))
    
    // API Rate: actual requests in last hour divided by 3600 (seconds)
    const recentCount = recentLogs?.length || 0
    const baseRate = recentCount / 3600
    // Real-time activity: logs in last 5 seconds
    const fiveSecsAgo = new Date(Date.now() - 5000).getTime()
    const activeRecentlyCount = recentLogs?.filter(l => new Date(l.created_at).getTime() > fiveSecsAgo).length || 0
    
      // User requirement: 4.0 per 1 request
      const apiRate = Number((activeRecentlyCount * 4.0).toFixed(2))

    return NextResponse.json({
      metrics: {
        cpu: `${cpu}%`,
        memFree: `${memFree} GB`,
        memTotal: `${memTotal} GB`,
        apiRate: `${apiRate} req/s`,
        activeUsers: (totalUsers || 0) + Math.floor(Math.random() * 5),
        totalUsers: totalUsers || 0,
        totalKeys: totalKeys || 0,
        totalRequests: totalLogs || 0,
        lastLogTime,
        activeRecently: activeRecentlyCount > 0
      },
      charts: {
        labels,
        users: userTrend,
        usage: usageTrend,
        memory: Array(days).fill(0).map((_, i) => 84 + Math.sin(i / 2) * 2 + Math.random())
      }
    })
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
