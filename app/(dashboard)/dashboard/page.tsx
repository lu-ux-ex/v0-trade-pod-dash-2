import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import type { UserProfile } from "@/lib/auth"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user || authError) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Create a default profile if none exists
  const userProfile: UserProfile = profile || {
    id: user.id,
    email: user.email || "",
    full_name: user.email?.split("@")[0] || "User",
    company_name: null,
    phone: null,
    role: "member" as const,
    membership_type: "basic",
    trade_type: null,
    is_active: true,
    must_change_password: false,
    profile_completed: false,
    has_virtual_mail: false,
    has_leads_access: false,
    has_directory_listing: false,
    avatar_url: null,
    bio: null,
    website: null,
    services: null,
    service_areas: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return <DashboardContent profile={userProfile} />
}
