"use client"

import React from "react"

import { useState, useEffect } from "react"
import { CalendarDays, MapPin, Users, Loader2 } from "lucide-react"
import { WidgetCard } from "@/components/dashboard/widget-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  start_time: string
  location: string
  attendees: number
  max_capacity: number
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

export function EventsWidget() {
  const [events, setEvents] = useState<Event[]>([])
  const [myRsvps, setMyRsvps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Load upcoming events
        const today = new Date().toISOString().split('T')[0]
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .eq("is_published", true)
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(3)
        
        setEvents(eventsData || [])

        // Load user's RSVPs
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          const { data: rsvpData } = await supabase
            .from("event_attendees")
            .select("event_id")
            .eq("user_id", userData.user.id)
          
          setMyRsvps((rsvpData || []).map(r => r.event_id))
        }
      } catch (error) {
        console.error("Error loading events:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleRsvp = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setRsvpLoading(eventId)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const isRsvped = myRsvps.includes(eventId)

      if (isRsvped) {
        await supabase
          .from("event_attendees")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", userData.user.id)
        
        setMyRsvps(myRsvps.filter(id => id !== eventId))
        setEvents(events.map(e => e.id === eventId ? { ...e, attendees: Math.max(0, (e.attendees || 0) - 1) } : e))
      } else {
        await supabase
          .from("event_attendees")
          .insert({ event_id: eventId, user_id: userData.user.id })
        
        setMyRsvps([...myRsvps, eventId])
        setEvents(events.map(e => e.id === eventId ? { ...e, attendees: (e.attendees || 0) + 1 } : e))
      }
    } catch (error) {
      console.error("Error updating RSVP:", error)
    } finally {
      setRsvpLoading(null)
    }
  }

  if (loading) {
    return (
      <WidgetCard title="Events & Networking" icon={CalendarDays} action={{ label: "View All", href: "/events" }}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </WidgetCard>
    )
  }

  if (events.length === 0) {
    return (
      <WidgetCard title="Events & Networking" icon={CalendarDays} action={{ label: "View All", href: "/events" }}>
        <div className="py-8 text-center text-muted-foreground text-sm">
          No upcoming events
        </div>
      </WidgetCard>
    )
  }

  return (
    <WidgetCard title="Events & Networking" icon={CalendarDays} action={{ label: "View All", href: "/events" }}>
      <div className="space-y-3">
        {events.map((event) => {
          const isRsvped = myRsvps.includes(event.id)
          return (
            <Link
              key={event.id}
              href="/events"
              className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-foreground">{event.title}</h4>
                    {isRsvped && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        RSVP'd
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {formatDate(event.event_date)} • {event.start_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.attendees || 0}/{event.max_capacity || 20} attending
                    </span>
                  </div>
                </div>
                <Button
                  variant={isRsvped ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                  onClick={(e) => handleRsvp(event.id, e)}
                  disabled={rsvpLoading === event.id}
                >
                  {rsvpLoading === event.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isRsvped ? (
                    "Cancel"
                  ) : (
                    "RSVP"
                  )}
                </Button>
              </div>
            </Link>
          )
        })}
      </div>
    </WidgetCard>
  )
}
