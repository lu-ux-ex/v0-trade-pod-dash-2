import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Use service role client for admin operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // Get the new member data
    const body = await request.json()
    const {
      email,
      fullName,
      companyName,
      phone,
      role,
      hasVirtualMail,
      hasLeadsAccess,
      hasDirectoryListing,
      tempPassword: customPassword,
      membershipType, // Declare the membershipType variable here
    } = body

    // Use custom password if provided, otherwise generate one
    const tempPassword = customPassword || generateTempPassword()
    
    if (!tempPassword || tempPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: fullName,
        company_name: companyName,
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Set default features based on role
    const userRole = role || "member"
    const defaultFeatures = {
      admin: { virtualMail: true, leads: true, directory: true },
      member: { virtualMail: hasVirtualMail ?? true, leads: hasLeadsAccess ?? true, directory: hasDirectoryListing ?? true },
      partner: { virtualMail: false, leads: false, directory: true },
    }
    const features = defaultFeatures[userRole as keyof typeof defaultFeatures] || defaultFeatures.member

    // Create or update the profile (upsert handles cases where profile already exists)
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: authData.user.id,
      email,
      full_name: fullName,
      company_name: companyName,
      phone,
      role: userRole,
      membership_type: "workspace", // Keep for backward compatibility
      has_virtual_mail: features.virtualMail,
      has_leads_access: features.leads,
      has_directory_listing: features.directory,
      is_active: true,
      must_change_password: true,
      profile_completed: false,
    }, { onConflict: 'id' })

    if (profileError) {
      console.error("Profile error:", profileError)
      // Clean up - delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        tempPassword,
      },
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
