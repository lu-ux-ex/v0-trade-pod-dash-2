import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type UserRole = "admin" | "member" | "partner"

export interface UserProfile {
  id: string
  email: string
  full_name: string
  company_name: string | null
  phone: string | null
  role: UserRole
  membership_type: string | null
  trade_type: string | null
  is_active: boolean
  must_change_password: boolean
  profile_completed: boolean
  has_virtual_mail: boolean
  has_leads_access: boolean
  has_directory_listing: boolean
  avatar_url: string | null
  bio: string | null
  website: string | null
  services: string[] | null
  service_areas: string[] | null
  created_at: string
  updated_at: string
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return profile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireAdmin() {
  const profile = await getUserProfile()
  if (!profile || profile.role !== "admin") {
    redirect("/")
  }
  return profile
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await getUserProfile()
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect("/")
  }
  return profile
}

export function canAccessFeature(profile: UserProfile | null, feature: string): boolean {
  if (!profile) return false

  // Admins can access everything
  if (profile.role === "admin") return true

  switch (feature) {
    case "virtual_mail":
      return profile.has_virtual_mail
    case "leads":
      return profile.has_leads_access
    case "directory":
      return profile.has_directory_listing
    case "bookings":
      return profile.role === "member" || profile.role === "admin"
    case "perks":
      return true // All authenticated users can view perks
    case "community":
      return true // All authenticated users can access community
    case "events":
      return true // All authenticated users can view events
    case "resources":
      return true // All authenticated users can view resources
    case "admin":
      return profile.role === "admin"
    default:
      return false
  }
}
