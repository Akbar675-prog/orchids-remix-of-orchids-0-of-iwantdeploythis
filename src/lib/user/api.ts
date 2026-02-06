import { isSupabaseEnabled } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import {
  convertFromApiFormat,
  defaultPreferences,
} from "@/lib/user-preference-store/utils"
import type { UserProfile } from "./types"

export async function getSupabaseUser() {
  const supabase = await createClient()
  if (!supabase) return { supabase: null, user: null }

  const { data } = await supabase.auth.getUser()
  return {
    supabase,
    user: data.user ?? null,
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    if (!isSupabaseEnabled) {
        return {
          id: "guest",
          email: "guest@chat.visora.my.id",
          display_name: "Guest",
          profile_image: "",
          anonymous: true,
          preferences: defaultPreferences,
        } as UserProfile
    }

    const { supabase, user } = await getSupabaseUser()
    
    if (!supabase || !user) {
      return null
    }

    const { data: userProfileData, error } = await supabase
      .from("users")
      .select("*, user_preferences(*)")
      .eq("id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user profile:", error)
    }

    if (!userProfileData) {
      return {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
        profile_image: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        anonymous: false,
        preferences: defaultPreferences,
      } as UserProfile
    }

    const formattedPreferences = userProfileData?.user_preferences
      ? convertFromApiFormat(userProfileData.user_preferences)
      : defaultPreferences

    return {
      ...userProfileData,
      id: user.id,
      email: user.email,
      profile_image: user.user_metadata?.avatar_url || user.user_metadata?.picture || userProfileData.profile_image,
      display_name: user.user_metadata?.full_name || user.user_metadata?.name || userProfileData.display_name || user.email,
      preferences: formattedPreferences,
    } as UserProfile
  } catch (err) {
    console.error("getUserProfile exception:", err)
    return null
  }
}
