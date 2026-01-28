"use client"

import { useState, useEffect } from "react"
import { Megaphone, ChevronRight, Loader2 } from "lucide-react"
import { WidgetCard } from "@/components/dashboard/widget-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Announcement {
  id: string
  title: string
  content: string
  announcement_type: string
  is_published: boolean
  publish_date: string
  cta_text: string | null
  cta_link: string | null
  created_at: string
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

export function AnnouncementsWidget() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3)
        
        if (error) throw error
        setAnnouncements(data || [])
      } catch (error) {
        console.error("Error loading announcements:", error)
      } finally {
        setLoading(false)
      }
    }
    loadAnnouncements()
  }, [])

  if (loading) {
    return (
      <WidgetCard title="Announcements" icon={Megaphone} action={{ label: "View All", href: "/community" }}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </WidgetCard>
    )
  }

  if (announcements.length === 0) {
    return (
      <WidgetCard title="Announcements" icon={Megaphone} action={{ label: "View All", href: "/community" }}>
        <div className="py-8 text-center text-muted-foreground text-sm">
          No announcements at this time
        </div>
      </WidgetCard>
    )
  }

  return (
    <WidgetCard title="Announcements" icon={Megaphone} action={{ label: "View All", href: "/community" }}>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div
              className={`w-1 shrink-0 rounded-full ${
                announcement.announcement_type === "urgent"
                  ? "bg-primary"
                  : announcement.announcement_type === "event"
                    ? "bg-blue-500"
                    : "bg-muted-foreground"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm text-foreground">{announcement.title}</h4>
                {announcement.announcement_type === "urgent" && (
                  <Badge variant="destructive" className="shrink-0 text-xs">
                    Important
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{announcement.content}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{getTimeAgo(announcement.created_at)}</span>
                {announcement.cta_text && announcement.cta_link && (
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" asChild>
                    <Link href={announcement.cta_link}>
                      {announcement.cta_text}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
