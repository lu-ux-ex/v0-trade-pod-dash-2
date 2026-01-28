import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/change-password", "/setup", "/api/setup", "/api/"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Skip middleware for static files and images
  if (pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname.includes(".")) {
    return supabaseResponse
  }

  // If not authenticated and trying to access protected routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // If authenticated, check profile and role
  if (user) {
    if (pathname.startsWith("/auth/")) {
      // Only redirect away from login if authenticated and NOT needing password change
      if (pathname === "/auth/login") {
        // Check if user needs to change password first
        const { data: profile } = await supabase
          .from("profiles")
          .select("must_change_password")
          .eq("id", user.id)
          .single()

        if (profile?.must_change_password) {
          const url = request.nextUrl.clone()
          url.pathname = "/auth/change-password"
          return NextResponse.redirect(url)
        }

        // User is logged in and doesn't need password change, go to dashboard
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
      // Allow access to change-password and other auth pages
      return supabaseResponse
    }

    // Fetch user profile for role checking
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, must_change_password, is_active")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return supabaseResponse
    }

    // If user must change password, redirect to change-password page
    if (profile.must_change_password) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/change-password"
      return NextResponse.redirect(url)
    }

    // If user is not active, sign them out and redirect to login
    if (!profile.is_active) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("error", "account_inactive")
      return NextResponse.redirect(url)
    }

    const isAdminRoute = pathname.includes("/admin")

    if (isAdminRoute && profile.role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
