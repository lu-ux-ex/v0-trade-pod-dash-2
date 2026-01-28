"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Users, FileText, BarChart3, Calendar, Mail, CheckCircle2, ArrowRight, Wrench } from "lucide-react"
import type { UserProfile } from "@/lib/auth"

interface AdminDashboardContentProps {
  stats: {
    totalMembers: number
    activeMembers: number
    pendingBookings: number
    pendingMail: number
  }
  recentMembers: UserProfile[]
}

const quickActions = [
  {
    title: "Member Management",
    description: "Manage member accounts, roles, and permissions",
    icon: Users,
    href: "/admin/members",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    title: "Operations",
    description: "Manage facilities, bookings, and mail",
    icon: Wrench,
    href: "/admin/operations",
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  },
  {
    title: "Content Manager",
    description: "Manage announcements, events, and resources",
    icon: FileText,
    href: "/admin/content",
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    title: "Analytics",
    description: "View engagement and performance metrics",
    icon: BarChart3,
    href: "/admin/analytics",
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  },
]

export function AdminDashboardContent({ stats, recentMembers }: AdminDashboardContentProps) {
  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }

  return (
    <div className="p-4 md:p-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.activeMembers}</p>
            <p className="text-xs text-muted-foreground">Active Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.pendingBookings}</p>
            <p className="text-xs text-muted-foreground">Pending Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="w-6 h-6 mx-auto text-teal-600 mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.pendingMail}</p>
            <p className="text-xs text-muted-foreground">Mail to Process</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Members */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Recent Members
            <Button variant="link" size="sm" className="text-primary" asChild>
              <Link href="/admin/members">View All</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
            ) : (
              recentMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{member.full_name || "No name"}</p>
                    <p className="text-xs text-muted-foreground">{member.company_name || member.email}</p>
                  </div>
                  <Badge variant={member.role === "admin" ? "destructive" : "secondary"} className="text-xs">
                    {member.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(member.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
