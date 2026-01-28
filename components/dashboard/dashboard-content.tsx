"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { AnnouncementsWidget } from "@/components/widgets/announcements-widget"
import { BookingsWidget } from "@/components/widgets/bookings-widget"
import { VirtualMailWidget } from "@/components/widgets/virtual-mail-widget"
import { LeadsWidget } from "@/components/widgets/leads-widget"
import { EventsWidget } from "@/components/widgets/events-widget"
import { PerksWidget } from "@/components/widgets/perks-widget"
import { CommunityWidget } from "@/components/widgets/community-widget"
import { ResourcesWidget } from "@/components/widgets/resources-widget"
import { Users, Calendar, Mail, TrendingUp } from "lucide-react"
import type { UserProfile } from "@/lib/auth"

interface DashboardContentProps {
  profile: UserProfile
}

function canAccessFeature(profile: UserProfile, feature: string): boolean {
  if (profile.role === "admin") return true

  switch (feature) {
    case "virtual_mail":
      return profile.has_virtual_mail
    case "leads":
      return profile.has_leads_access
    case "directory":
      return profile.has_directory_listing
    case "bookings":
      return profile.role === "member" || profile.role === "admin"
    case "perks":
    case "community":
    case "events":
    case "resources":
      return true
    default:
      return false
  }
}

export function DashboardContent({ profile }: DashboardContentProps) {
  const firstName = profile.full_name?.split(" ")[0] || "there"

  return (
    <div className="p-4 md:p-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Welcome back, {firstName}</h2>
        <p className="text-muted-foreground mt-1">Here's what's happening at TradePod today</p>
      </div>

      {/* Stats Row - Show based on role/features */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {canAccessFeature(profile, "leads") && (
          <StatCard
            title="New Leads"
            value={5}
            description="This month"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
        )}
        {canAccessFeature(profile, "bookings") && (
          <StatCard title="Upcoming Bookings" value={3} description="Next 7 days" icon={Calendar} />
        )}
        {canAccessFeature(profile, "virtual_mail") && (
          <StatCard title="Unread Mail" value={3} description="Items waiting" icon={Mail} />
        )}
        {canAccessFeature(profile, "directory") && (
          <StatCard
            title="Profile Views"
            value={127}
            description="This month"
            icon={TrendingUp}
            trend={{ value: 8, isPositive: true }}
          />
        )}
      </div>

      {/* Widget Grid - Show based on role/features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnnouncementsWidget />

        {canAccessFeature(profile, "bookings") && <BookingsWidget />}

        {canAccessFeature(profile, "virtual_mail") && <VirtualMailWidget />}

        {canAccessFeature(profile, "leads") && <LeadsWidget />}

        <EventsWidget />

        <PerksWidget />

        <CommunityWidget />

        <ResourcesWidget />
      </div>
    </div>
  )
}
