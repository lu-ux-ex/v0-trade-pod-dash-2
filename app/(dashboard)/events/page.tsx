"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarDays, MapPin, Users, Clock, Check, Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  location: string
  attendees: number
  max_capacity: number
  event_type: string
  image_url: string
  visible_to_partners: boolean
  visible_to_members: boolean
  is_published: boolean
}

interface EventAttendee {
  event_id: string
  user_id: string
}

interface UserProfile {
  id: string
  role: "admin" | "member" | "partner"
}

export default function EventsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [myRsvps, setMyRsvps] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar")
  const [isRsvping, setIsRsvping] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single()

      if (profileData) {
        setProfile(profileData as UserProfile)
        
        // Get events based on role visibility
        let query = supabase
          .from("events")
          .select("*")
          .eq("is_published", true)
          .order("event_date", { ascending: true })

        if (profileData.role === "partner") {
          query = query.eq("visible_to_partners", true)
        } else if (profileData.role === "member") {
          query = query.eq("visible_to_members", true)
        }
        // Admins see all published events

        const { data: eventsData } = await query
        if (eventsData) {
          setEvents(eventsData)
        }

        // Get user's RSVPs
        const { data: rsvpData } = await supabase
          .from("event_attendees")
          .select("event_id")
          .eq("user_id", user.id)

        if (rsvpData) {
          setMyRsvps(rsvpData.map(r => r.event_id))
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "networking":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Networking</Badge>
      case "workshop":
        return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Workshop</Badge>
      case "training":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Training</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const handleRsvp = async (event: Event) => {
    if (!profile) return
    setIsRsvping(true)

    try {
      const isCurrentlyRsvp = myRsvps.includes(event.id)

      if (isCurrentlyRsvp) {
        // Remove RSVP
        const { error } = await supabase
          .from("event_attendees")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", profile.id)

        if (error) throw error

        setMyRsvps(myRsvps.filter(id => id !== event.id))
        
        // Update attendee count
        await supabase
          .from("events")
          .update({ attendees: Math.max(0, event.attendees - 1) })
          .eq("id", event.id)

        setEvents(events.map(e => 
          e.id === event.id ? { ...e, attendees: Math.max(0, e.attendees - 1) } : e
        ))

        toast({
          title: "RSVP Cancelled",
          description: `You are no longer attending ${event.title}`,
        })
      } else {
        // Add RSVP
        const { error } = await supabase
          .from("event_attendees")
          .insert({ event_id: event.id, user_id: profile.id })

        if (error) throw error

        setMyRsvps([...myRsvps, event.id])

        // Update attendee count
        await supabase
          .from("events")
          .update({ attendees: event.attendees + 1 })
          .eq("id", event.id)

        setEvents(events.map(e => 
          e.id === event.id ? { ...e, attendees: e.attendees + 1 } : e
        ))

        toast({
          title: "RSVP Confirmed",
          description: `You're now attending ${event.title}`,
        })
      }
    } catch (error) {
      console.error("Error updating RSVP:", error)
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRsvping(false)
      setRsvpDialogOpen(false)
    }
  }

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.event_date === dateStr)
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= new Date())
  const myEvents = events.filter((e) => myRsvps.includes(e.id))
  const pastEvents = events.filter((e) => new Date(e.event_date) < new Date())

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className={viewMode !== "calendar" ? "bg-transparent" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            type="button"
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode !== "list" ? "bg-transparent" : ""}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg mb-2">No Events Available</h3>
            <p className="text-muted-foreground">Check back later for upcoming events</p>
          </CardContent>
        </Card>
      ) : viewMode === "calendar" ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-lg">{monthName}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 min-h-24" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayEvents = getEventsForDate(day)
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
                
                return (
                  <div
                    key={day}
                    className={`p-2 min-h-24 border rounded-lg ${isToday ? "bg-primary/5 border-primary" : "border-border"}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : "text-foreground"}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => {
                            setSelectedEvent(event)
                            setRsvpDialogOpen(true)
                          }}
                          className={`w-full text-left text-xs p-1 rounded truncate ${
                            myRsvps.includes(event.id)
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {event.title}
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-primary/10" />
                <span className="text-muted-foreground">Upcoming</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900" />
                <span className="text-muted-foreground">Attending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="my-events">My Events ({myEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => {
                  setSelectedEvent(event)
                  setRsvpDialogOpen(true)
                }}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-64 h-40 md:h-auto bg-muted">
                    <img
                      src={event.image_url || "/placeholder.svg?height=200&width=400"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(event.event_type)}
                          {myRsvps.includes(event.id) && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Check className="w-3 h-3 mr-1" />
                              Attending
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            {formatDate(event.event_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.start_time}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendees}/{event.max_capacity} attending
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          variant={myRsvps.includes(event.id) ? "outline" : "default"}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRsvp(event)
                          }}
                          disabled={isRsvping}
                          className={myRsvps.includes(event.id) ? "bg-transparent" : ""}
                        >
                          {isRsvping ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : myRsvps.includes(event.id) ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Attending
                            </>
                          ) : (
                            "RSVP Now"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming events</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-events" className="space-y-4">
            {myEvents.length > 0 ? (
              myEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(event.event_type)}
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Check className="w-3 h-3 mr-1" />
                            Confirmed
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            {formatDate(event.event_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.start_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleRsvp(event)}
                          disabled={isRsvping}
                        >
                          {isRsvping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel RSVP"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>You haven't RSVP'd to any events yet</p>
                  <Button type="button" className="mt-4 bg-transparent" variant="outline" onClick={() => setViewMode("calendar")}>
                    Browse Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastEvents.length > 0 ? (
              pastEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden opacity-75">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(event.event_type)}
                          {myRsvps.includes(event.id) && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Attended
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            {formatDate(event.event_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No past events to show</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={rsvpDialogOpen} onOpenChange={setRsvpDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedEvent && (
            <>
              <div
                className="w-full h-40 -mt-6 -mx-6 mb-4 overflow-hidden rounded-t-lg"
                style={{ width: "calc(100% + 48px)" }}
              >
                <img
                  src={selectedEvent.image_url || "/placeholder.svg?height=200&width=400"}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getTypeBadge(selectedEvent.event_type)}
                </div>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>{selectedEvent.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  <span>{formatDate(selectedEvent.event_date)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span>{selectedEvent.start_time}{selectedEvent.end_time ? ` - ${selectedEvent.end_time}` : ""}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span>{selectedEvent.attendees}/{selectedEvent.max_capacity} attending</span>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRsvpDialogOpen(false)} className="bg-transparent">
                  Close
                </Button>
                <Button
                  type="button"
                  variant={myRsvps.includes(selectedEvent.id) ? "outline" : "default"}
                  onClick={() => handleRsvp(selectedEvent)}
                  disabled={isRsvping}
                  className={myRsvps.includes(selectedEvent.id) ? "bg-transparent" : ""}
                >
                  {isRsvping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : myRsvps.includes(selectedEvent.id) ? (
                    "Cancel RSVP"
                  ) : (
                    "RSVP Now"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
