import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type UserRole = "admin" | "member" | "partner" | "directory_member"

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
      // Only paid members and admins
      return profile.has_virtual_mail && (profile.role === "member" || profile.role === "admin")
    case "leads":
      // Only paid members and admins
      return profile.has_leads_access && (profile.role === "member" || profile.role === "admin")
    case "directory":
      // Everyone can view directory
      return profile.has_directory_listing
    case "bookings":
      // Only paid members, partners, and admins
      return profile.role === "member" || profile.role === "partner" || profile.role === "admin"
    case "perks":
      // Everyone can VIEW perks, but restrictions on use handled in UI
      return true
    case "community":
      // Everyone can view, but posting restricted
      return true
    case "community_post":
      // Only paid members, partners, and admins can post
      return profile.role === "member" || profile.role === "partner" || profile.role === "admin"
    case "events":
      // Everyone can view events
      return true
    case "resources":
      // Everyone can view resources
      return true
    case "admin":
      return profile.role === "admin"
    case "profile_edit":
      // Everyone can edit their own profile
      return true
    default:
      return false
  }
}

export function getUpgradeMessage(feature: string): string {
  switch (feature) {
    case "bookings":
      return "Upgrade to a Member or Partner account to book facilities"
    case "virtual_mail":
      return "Upgrade to access Virtual Office services"
    case "leads":
      return "Upgrade to receive exclusive trade leads"
    case "community_post":
      return "Upgrade to post in the community"
    default:
      return "Upgrade your membership to access this feature"
  }
}
