"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronLeft,
  LayoutDashboard,
  Calendar,
  Mail,
  Users,
  FileText,
  Gift,
  MessageSquare,
  BarChart3,
  Settings,
  Wrench,
  LogOut,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { UserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"

function TradePodLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="32" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="28" fill="currentColor">
        TRADEPOD
      </text>
      <text x="0" y="46" fontFamily="Arial, sans-serif" fontSize="10" fill="currentColor" opacity="0.7">
        THE GROWTH SPACE
      </text>
    </svg>
  )
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
  feature?: string
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bookings", href: "/bookings", icon: Calendar, badge: 2, feature: "bookings" },
  { name: "Virtual Mail", href: "/mail", icon: Mail, badge: 3, feature: "virtual_mail" },
  { name: "Leads", href: "/leads", icon: Users, badge: 5, feature: "leads" },
  { name: "My Profile", href: "/profile", icon: FileText },
  { name: "Perks & Deals", href: "/perks", icon: Gift },
  { name: "AI", href: "/ai", icon: Sparkles },
  { name: "Community", href: "/community", icon: MessageSquare, feature: "community" },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Resources", href: "/resources", icon: FileText, feature: "resources" },
]

const adminNavigation: NavItem[] = [
  { name: "Admin Console", href: "/admin", icon: Settings },
  { name: "Members", href: "/admin/members", icon: Users },
  { name: "Operations", href: "/admin/operations", icon: Wrench },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
]

interface SidebarProps {
  profile: UserProfile
}

function canAccessFeature(profile: UserProfile, feature?: string): boolean {
  if (!feature) return true
  if (profile.role === "admin") return true

  // Partners have limited access - only profile, perks, and events
  if (profile.role === "partner") {
    switch (feature) {
      case "virtual_mail":
      case "leads":
      case "bookings":
      case "community":
      case "resources":
      case "ai":
        return false
      default:
        return true
    }
  }

  // Members have access based on their feature flags
  switch (feature) {
    case "virtual_mail":
      return profile.has_virtual_mail
    case "leads":
      return profile.has_leads_access
    case "bookings":
    case "community":
    case "resources":
    case "ai":
      return true
    default:
      return true
  }
}

export function Sidebar({ profile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isAdmin = profile.role === "admin"
  const filteredNavigation = navigation.filter((item) => canAccessFeature(profile, item.feature))

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator"
      case "partner":
        return "Partner"
      default:
        return "Member"
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[260px]",
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-3">
              <TradePodLogo className="h-10 w-auto text-foreground" />
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto">
              <img
                src="/images/472180372-1544693072889416-7341356055758265641-n.jpg"
                alt="TradePod"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("text-muted-foreground hover:text-foreground", collapsed && "hidden")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge
                        variant={isActive ? "secondary" : "default"}
                        className={cn(
                          "ml-auto text-xs h-5 min-w-5 flex items-center justify-center",
                          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "",
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className={cn("my-4 border-t border-border", collapsed && "mx-2")} />
              {!collapsed && (
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
              )}
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* User Profile with Sign Out */}
        <div className="p-3 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors",
                  collapsed && "justify-center",
                )}
              >
                <Avatar className="w-9 h-9">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(profile.full_name || "User")}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{getRoleLabel(profile.role)}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <FileText className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {[
            filteredNavigation[0],
            filteredNavigation.find((n) => n.href === "/bookings"),
            filteredNavigation.find((n) => n.href === "/mail"),
            filteredNavigation.find((n) => n.href === "/leads") || filteredNavigation[1],
            { name: "More", href: "/profile", icon: Settings },
          ]
            .filter(Boolean)
            .map((item) => {
              if (!item) return null
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.name}</span>
                </Link>
              )
            })}
        </div>
      </nav>
    </>
  )
}
