import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { MembersPageClient } from "./members-client"

export default async function MembersPage() {
  await requireAdmin()

  const supabase = await createClient()

  const { data: members, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching members:", error)
  }

  return <MembersPageClient initialMembers={members || []} />
}
