"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import type { UserProfile } from "@/lib/auth"

interface DashboardShellProps {
  profile: UserProfile
  children: React.ReactNode
}

export function DashboardShell({ profile, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar profile={profile} />

      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        <Header title="Dashboard" profile={profile} onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
