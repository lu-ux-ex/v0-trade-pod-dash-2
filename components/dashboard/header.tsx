"use client"

import { Bell, Search, Menu, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"

interface HeaderProps {
  title?: string
  profile?: UserProfile
  onMenuClick?: () => void
}

export function Header({ title = "Dashboard", profile, onMenuClick }: HeaderProps) {
  const router = useRouter()

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

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <Link href="/" className="md:hidden flex items-center gap-2">
          <img
            src="/images/472180372-1544693072889416-7341356055758265641-n.jpg"
            alt="TradePod"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-foreground">TradePod</span>
        </Link>
        <h1 className="hidden md:block text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search - Hidden on mobile */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <Input placeholder="Search..." className="w-64 pl-9 bg-muted border-0 focus-visible:ring-1" />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                4
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">New lead assigned</span>
              <span className="text-xs text-muted-foreground">Kitchen renovation project in Bristol</span>
              <span className="text-xs text-muted-foreground">2 minutes ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">New mail received</span>
              <span className="text-xs text-muted-foreground">Letter from HMRC scanned and ready</span>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Booking confirmed</span>
              <span className="text-xs text-muted-foreground">Meeting Room A - Tomorrow 10:00 AM</span>
              <span className="text-xs text-muted-foreground">3 hours ago</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-primary justify-center">View all notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu - Mobile only */}
        {profile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(profile.full_name || "User")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
