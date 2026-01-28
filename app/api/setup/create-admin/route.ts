import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// This endpoint should only be used once to create the initial admin
// After use, you should delete this file for security

export async function POST(request: Request) {
  try {
    const { email, fullName, secretKey } = await request.json()

    // Simple protection - require a secret key
    if (secretKey !== "TRADEPOD_SETUP_2024") {
      return NextResponse.json({ error: "Invalid secret key" }, { status: 401 })
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL environment variable" }, { status: 500 })
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY environment variable" }, { status: 500 })
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Generate a temporary password
    const tempPassword = "TradePod2024!"

    // First, check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error("List users error:", listError)
      return NextResponse.json({ error: `Failed to check existing users: ${listError.message}` }, { status: 400 })
    }

    const existingUser = existingUsers?.users?.find((u) => u.email === email)

    if (existingUser) {
      // User already exists - check if profile exists
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", existingUser.id)
        .single()

      if (existingProfile) {
        // Both user and profile exist - just return the credentials
        return NextResponse.json({
          success: true,
          message: "User already exists! Use these credentials to log in.",
          credentials: {
            email: email,
            temporaryPassword: tempPassword,
            loginUrl: "/auth/login",
          },
          note: "If the password doesn't work, the user may have already changed it.",
        })
      } else {
        // User exists but no profile - create profile
        const { error: profileError } = await supabaseAdmin.from("profiles").insert({
          id: existingUser.id,
          email: email,
          full_name: fullName || "Admin",
          company_name: "TradePod",
          role: "admin",
          membership_type: "premium",
          status: "active",
          is_active: true,
          has_virtual_mail: true,
          has_leads_access: true,
          has_directory_listing: true,
          must_change_password: true,
        })

        if (profileError) {
          return NextResponse.json({ error: `Profile creation failed: ${profileError.message}` }, { status: 400 })
        }

        return NextResponse.json({
          success: true,
          message: "Profile created for existing user!",
          credentials: {
            email: email,
            temporaryPassword: tempPassword,
            loginUrl: "/auth/login",
          },
        })
      }
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm the email
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: `Auth creation failed: ${authError.message}` }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user - no user data returned" }, { status: 400 })
    }

    // Create the profile with admin role
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      email: email,
      full_name: fullName || "Admin",
      company_name: "TradePod",
      role: "admin",
      membership_type: "premium",
      status: "active",
      is_active: true,
      has_virtual_mail: true,
      has_leads_access: true,
      has_directory_listing: true,
      must_change_password: true,
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      // Try to clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: `Profile creation failed: ${profileError.message}` }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      credentials: {
        email: email,
        temporaryPassword: tempPassword,
        loginUrl: "/auth/login",
      },
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
