"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Plus, Users, X } from "lucide-react"

const bookings = [
  {
    id: 1,
    facility: "Meeting Room A",
    type: "meeting_room",
    date: "2025-01-17",
    startTime: "10:00",
    endTime: "11:30",
    status: "confirmed",
    capacity: 8,
    amenities: ["Projector", "Whiteboard", "Video Conferencing"],
  },
  {
    id: 2,
    facility: "Workshop Bay 2",
    type: "workshop",
    date: "2025-01-17",
    startTime: "14:00",
    endTime: "17:00",
    status: "pending",
    capacity: 4,
    amenities: ["Power Tools", "Workbench", "Ventilation"],
  },
  {
    id: 3,
    facility: "Hot Desk",
    type: "desk",
    date: "2025-01-20",
    startTime: "09:00",
    endTime: "18:00",
    status: "confirmed",
    capacity: 1,
    amenities: ["Monitor", "Keyboard", "Fast WiFi"],
  },
  {
    id: 4,
    facility: "Training Room",
    type: "training",
    date: "2025-01-22",
    startTime: "09:00",
    endTime: "12:00",
    status: "confirmed",
    capacity: 20,
    amenities: ["Projector", "Audio System", "Seating"],
  },
]

const facilities = [
  {
    id: 1,
    name: "Meeting Room A",
    type: "meeting_room",
    capacity: 8,
    hourlyRate: "£15",
    image: "/modern-meeting-room-with-glass-walls.jpg",
    available: true,
  },
  {
    id: 2,
    name: "Meeting Room B",
    type: "meeting_room",
    capacity: 4,
    hourlyRate: "£10",
    image: "/small-meeting-room-with-table.jpg",
    available: true,
  },
  {
    id: 3,
    name: "Workshop Bay 1",
    type: "workshop",
    capacity: 4,
    hourlyRate: "£25",
    image: "/industrial-workshop-with-tools.jpg",
    available: false,
  },
  {
    id: 4,
    name: "Workshop Bay 2",
    type: "workshop",
    capacity: 4,
    hourlyRate: "£25",
    image: "/workshop-space-with-workbench.jpg",
    available: true,
  },
  {
    id: 5,
    name: "Training Room",
    type: "training",
    capacity: 20,
    hourlyRate: "£40",
    image: "/training-room-with-rows-of-desks.jpg",
    available: true,
  },
  {
    id: 6,
    name: "Hot Desk Area",
    type: "desk",
    capacity: 10,
    hourlyRate: "£8",
    image: "/coworking-hot-desk-area.jpg",
    available: true,
  },
]

const memberEntitlements = {
  meetingRoomHours: 4,
  meetingRoomUsed: 1.5,
  workshopHours: 8,
  workshopUsed: 3,
}

export default function BookingsPage() {
  const [bookDialogOpen, setBookDialogOpen] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState("")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <>
      {/* Entitlements Banner */}
      <Card className="mb-6 bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Your Monthly Entitlements</h3>
              <p className="text-sm text-muted-foreground">Included with your Workspace membership</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {memberEntitlements.meetingRoomHours - memberEntitlements.meetingRoomUsed}
                </p>
                <p className="text-xs text-muted-foreground">Meeting Room hrs left</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {memberEntitlements.workshopHours - memberEntitlements.workshopUsed}
                </p>
                <p className="text-xs text-muted-foreground">Workshop hrs left</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="facilities">Book a Space</TabsTrigger>
          </TabsList>

          <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Quick Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Book a Space</DialogTitle>
                <DialogDescription>Select a facility and time slot for your booking.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Facility</Label>
                  <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities
                        .filter((f) => f.available)
                        .map((facility) => (
                          <SelectItem key={facility.id} value={facility.id.toString()}>
                            {facility.name} ({facility.hourlyRate}/hr)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-01-17">Friday, 17 Jan 2025</SelectItem>
                      <SelectItem value="2025-01-20">Monday, 20 Jan 2025</SelectItem>
                      <SelectItem value="2025-01-21">Tuesday, 21 Jan 2025</SelectItem>
                      <SelectItem value="2025-01-22">Wednesday, 22 Jan 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                      <SelectContent>
                        {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="End" />
                      </SelectTrigger>
                      <SelectContent>
                        {["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(
                          (time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBookDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setBookDialogOpen(false)}>Request Booking</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="upcoming" className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 md:h-auto bg-muted flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{booking.facility}</h3>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Up to {booking.capacity} people
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {booking.amenities.map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {booking.status === "confirmed" && (
                          <Button variant="outline" size="sm" className="bg-transparent">
                            Modify
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No past bookings to show</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((facility) => (
              <Card key={facility.id} className={!facility.available ? "opacity-60" : ""}>
                <div className="h-32 bg-muted relative overflow-hidden">
                  <img
                    src={facility.image || "/placeholder.svg"}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                  {!facility.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">Currently Unavailable</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{facility.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {facility.capacity}
                        </span>
                        <span className="font-medium text-primary">{facility.hourlyRate}/hr</span>
                      </div>
                    </div>
                    <Button size="sm" disabled={!facility.available} onClick={() => setBookDialogOpen(true)}>
                      Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
