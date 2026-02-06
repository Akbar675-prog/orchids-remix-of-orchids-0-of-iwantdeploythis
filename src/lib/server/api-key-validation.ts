import { createGuestServerClient } from "@/lib/supabase/server-guest"

/**
 * Validates a Visora API key and returns the key data if valid.
 */
export async function validateApiKey(key: string): Promise<{ id: string, user_id: string } | null> {
  if (!key || !key.startsWith("vsk_")) return null

  const supabase = await createGuestServerClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("app_api_keys")
    .select("id, user_id")
    .eq("key", key)
    .single()

  if (error || !data) return null

  // Update last_used_at
  await supabase
    .from("app_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key", key)

  return data
}
