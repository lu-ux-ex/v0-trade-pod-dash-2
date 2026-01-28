"use client"

import { Calendar, Plus, Clock } from "lucide-react"
import { WidgetCard } from "@/components/dashboard/widget-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const upcomingBookings = [
  {
    id: 1,
    title: "Meeting Room A",
    date: "Tomorrow",
    time: "10:00 AM - 11:30 AM",
    status: "confirmed",
  },
  {
    id: 2,
    title: "Workshop Bay 2",
    date: "Friday, 17 Jan",
    time: "2:00 PM - 5:00 PM",
    status: "pending",
  },
  {
    id: 3,
    title: "Hot Desk",
    date: "Monday, 20 Jan",
    time: "9:00 AM - 6:00 PM",
    status: "confirmed",
  },
]

export function BookingsWidget() {
  return (
    <WidgetCard title="Bookings & Access" icon={Calendar} action={{ label: "View All", href: "/bookings" }}>
      <div className="space-y-3">
        <Button className="w-full" size="sm" asChild>
          <Link href="/bookings">
            <Plus className="w-4 h-4 mr-2" />
            Book a Room
          </Link>
        </Button>

        <div className="space-y-3 pt-2">
          {upcomingBookings.map((booking) => (
            <Link
              key={booking.id}
              href="/bookings"
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-colors block"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm text-foreground">{booking.title}</h4>
                  <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {booking.date}
                  </span>
                  <span className="text-xs text-muted-foreground">{booking.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </WidgetCard>
  )
}
