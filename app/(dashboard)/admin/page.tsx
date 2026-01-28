import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboardContent } from "./admin-content"

export default async function AdminDashboard() {
  await requireAdmin()

  const supabase = await createClient()

  // Fetch real stats from database
  const [
    { count: memberCount },
    { count: activeCount },
    { data: recentMembers },
    { count: pendingBookingsCount },
    { count: pendingMailCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("virtual_mail").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ])

  return (
    <AdminDashboardContent
      stats={{
        totalMembers: memberCount || 0,
        activeMembers: activeCount || 0,
        pendingBookings: pendingBookingsCount || 0,
        pendingMail: pendingMailCount || 0,
      }}
      recentMembers={recentMembers || []}
    />
  )
}
