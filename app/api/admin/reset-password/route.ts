import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Use service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: Request) {
  try {
    // Verify the requesting user is an admin
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // Get the reset data
    const body = await request.json()
    const { userId, newPassword } = body

    if (!userId || !newPassword) {
      return NextResponse.json({ error: "User ID and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Update the user's password in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Update the profile to require password change
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", userId)

    if (profileError) {
      console.error("Profile error:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
