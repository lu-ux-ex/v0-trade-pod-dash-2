import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Debug endpoint to check if a user exists

export async function POST(request: Request) {
  try {
    const { email, secretKey } = await request.json()

    if (secretKey !== "TRADEPOD_SETUP_2024") {
      return NextResponse.json({ error: "Invalid secret key" }, { status: 401 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Missing environment variables" }, { status: 500 })
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check auth users
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 })
    }

    const authUser = users?.users?.find((u) => u.email === email)

    // Check profiles table
    const { data: profiles, error: profileError } = await supabaseAdmin.from("profiles").select("*").eq("email", email)

    return NextResponse.json({
      authUserExists: !!authUser,
      authUser: authUser
        ? {
            id: authUser.id,
            email: authUser.email,
            confirmed: authUser.email_confirmed_at ? true : false,
            createdAt: authUser.created_at,
          }
        : null,
      profileExists: profiles && profiles.length > 0,
      profile: profiles?.[0] || null,
      profileError: profileError?.message || null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
