"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Building2,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Scan,
} from "lucide-react"

// Facilities/Rooms data
const initialFacilities = [
  {
    id: 1,
    name: "Meeting Room A",
    type: "meeting_room",
    capacity: 8,
    hourlyRate: 15,
    description: "Large meeting room with video conferencing facilities",
    amenities: ["Projector", "Whiteboard", "Video Conferencing", "Air Con"],
    available: true,
    image: "/modern-meeting-room-with-glass-walls.jpg",
  },
  {
    id: 2,
    name: "Meeting Room B",
    type: "meeting_room",
    capacity: 4,
    hourlyRate: 10,
    description: "Small meeting room ideal for quick catch-ups",
    amenities: ["Whiteboard", "TV Screen"],
    available: true,
    image: "/small-meeting-room-with-table.jpg",
  },
  {
    id: 3,
    name: "Workshop Bay 1",
    type: "workshop",
    capacity: 4,
    hourlyRate: 25,
    description: "Fully equipped workshop with power tools",
    amenities: ["Power Tools", "Workbench", "Ventilation", "3-Phase Power"],
    available: false,
    image: "/industrial-workshop-with-tools.jpg",
  },
  {
    id: 4,
    name: "Workshop Bay 2",
    type: "workshop",
    capacity: 4,
    hourlyRate: 25,
    description: "Workshop space with workbench and storage",
    amenities: ["Workbench", "Storage", "Ventilation"],
    available: true,
    image: "/workshop-space-with-workbench.jpg",
  },
  {
    id: 5,
    name: "Training Room",
    type: "training",
    capacity: 20,
    hourlyRate: 40,
    description: "Large training room with classroom-style seating",
    amenities: ["Projector", "Audio System", "Whiteboard", "Air Con"],
    available: true,
    image: "/training-room-with-rows-of-desks.jpg",
  },
  {
    id: 6,
    name: "Hot Desk Area",
    type: "desk",
    capacity: 10,
    hourlyRate: 8,
    description: "Flexible hot desk area with fast WiFi",
    amenities: ["Monitor", "Keyboard", "Fast WiFi", "Standing Desk Option"],
    available: true,
    image: "/coworking-hot-desk-area.jpg",
  },
]

// Pending bookings data
const pendingBookings = [
  {
    id: 1,
    memberName: "Mike Thompson",
    memberEmail: "mike@plumbingpros.co.uk",
    facility: "Workshop Bay 2",
    date: "2025-01-17",
    startTime: "14:00",
    endTime: "17:00",
    status: "pending",
    requestedAt: "2025-01-16 09:30",
  },
  {
    id: 2,
    memberName: "Sarah Jenkins",
    memberEmail: "sarah@sparkelectrics.co.uk",
    facility: "Meeting Room A",
    date: "2025-01-18",
    startTime: "10:00",
    endTime: "12:00",
    status: "pending",
    requestedAt: "2025-01-16 11:15",
  },
  {
    id: 3,
    memberName: "John Davies",
    memberEmail: "john@daviesplumbing.co.uk",
    facility: "Training Room",
    date: "2025-01-20",
    startTime: "09:00",
    endTime: "13:00",
    status: "pending",
    requestedAt: "2025-01-16 14:22",
  },
]

// Virtual mail awaiting action
const pendingMail = [
  {
    id: 1,
    memberName: "John Davies",
    memberEmail: "john@daviesplumbing.co.uk",
    sender: "HMRC",
    receivedAt: "2025-01-16 10:30",
    status: "awaiting_scan",
    type: "letter",
  },
  {
    id: 2,
    memberName: "Sarah Jenkins",
    memberEmail: "sarah@sparkelectrics.co.uk",
    sender: "Companies House",
    receivedAt: "2025-01-16 11:00",
    status: "awaiting_scan",
    type: "letter",
  },
  {
    id: 3,
    memberName: "Mike Thompson",
    memberEmail: "mike@plumbingpros.co.uk",
    sender: "Amazon",
    receivedAt: "2025-01-15 15:30",
    status: "awaiting_collection",
    type: "parcel",
  },
  {
    id: 4,
    memberName: "Lisa Carter",
    memberEmail: "lisa@carterbuilders.co.uk",
    sender: "Screwfix Trade",
    receivedAt: "2025-01-15 09:15",
    status: "awaiting_scan",
    type: "letter",
  },
]

const facilityTypes = [
  { value: "meeting_room", label: "Meeting Room" },
  { value: "workshop", label: "Workshop" },
  { value: "training", label: "Training Room" },
  { value: "desk", label: "Hot Desk" },
  { value: "office", label: "Private Office" },
  { value: "storage", label: "Storage Unit" },
]

const commonAmenities = [
  "Projector",
  "Whiteboard",
  "Video Conferencing",
  "TV Screen",
  "Air Con",
  "Power Tools",
  "Workbench",
  "Ventilation",
  "3-Phase Power",
  "Storage",
  "Monitor",
  "Keyboard",
  "Fast WiFi",
  "Standing Desk Option",
  "Audio System",
  "Kitchen Access",
]

export default function AdminOperationsPage() {
  const [facilities, setFacilities] = useState(initialFacilities)
  const [facilityDialogOpen, setFacilityDialogOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState<(typeof initialFacilities)[0] | null>(null)
  const [bookings, setBookings] = useState(pendingBookings)
  const [mail, setMail] = useState(pendingMail)

  // Form state for facility
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    capacity: "",
    hourlyRate: "",
    description: "",
    amenities: [] as string[],
    available: true,
  })

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      capacity: "",
      hourlyRate: "",
      description: "",
      amenities: [],
      available: true,
    })
    setEditingFacility(null)
  }

  const handleEditFacility = (facility: (typeof initialFacilities)[0]) => {
    setEditingFacility(facility)
    setFormData({
      name: facility.name,
      type: facility.type,
      capacity: facility.capacity.toString(),
      hourlyRate: facility.hourlyRate.toString(),
      description: facility.description,
      amenities: facility.amenities,
      available: facility.available,
    })
    setFacilityDialogOpen(true)
  }

  const handleSaveFacility = () => {
    if (editingFacility) {
      setFacilities(
        facilities.map((f) =>
          f.id === editingFacility.id
            ? {
                ...f,
                ...formData,
                capacity: Number.parseInt(formData.capacity),
                hourlyRate: Number.parseFloat(formData.hourlyRate),
              }
            : f,
        ),
      )
    } else {
      const newFacility = {
        id: Math.max(...facilities.map((f) => f.id)) + 1,
        ...formData,
        capacity: Number.parseInt(formData.capacity),
        hourlyRate: Number.parseFloat(formData.hourlyRate),
        image: "/facility-room.jpg",
      }
      setFacilities([...facilities, newFacility])
    }
    setFacilityDialogOpen(false)
    resetForm()
  }

  const handleDeleteFacility = (id: number) => {
    setFacilities(facilities.filter((f) => f.id !== id))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleBookingAction = (id: number, action: "approve" | "reject") => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: action === "approve" ? "confirmed" : "rejected" } : b)),
    )
  }

  const handleMailAction = (id: number, action: "scanned" | "collected" | "forwarded") => {
    setMail(mail.map((m) => (m.id === id ? { ...m, status: action } : m)))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="facilities" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="facilities" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Facilities</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Bookings</span>
            {bookings.filter((b) => b.status === "pending").length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {bookings.filter((b) => b.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="mail" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Mail</span>
            {mail.filter((m) => m.status === "awaiting_scan").length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {mail.filter((m) => m.status === "awaiting_scan").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Manage Facilities</h2>
              <p className="text-sm text-muted-foreground">Add, edit, or remove bookable spaces</p>
            </div>
            <Dialog
              open={facilityDialogOpen}
              onOpenChange={(open) => {
                setFacilityDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Facility
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingFacility ? "Edit Facility" : "Add New Facility"}</DialogTitle>
                  <DialogDescription>
                    {editingFacility
                      ? "Update the facility details below."
                      : "Enter the details for the new bookable space."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Facility Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Meeting Room C"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {facilityTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="e.g. 8"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (£)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="e.g. 15"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the facility..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amenities</Label>
                    <div className="flex flex-wrap gap-2">
                      {commonAmenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleAmenity(amenity)}
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="available">Available for Booking</Label>
                      <p className="text-xs text-muted-foreground">Members can book this facility</p>
                    </div>
                    <Switch
                      id="available"
                      checked={formData.available}
                      onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFacilityDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveFacility}>{editingFacility ? "Save Changes" : "Add Facility"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((facility) => (
              <Card key={facility.id} className={!facility.available ? "opacity-70" : ""}>
                <div className="h-32 bg-muted relative overflow-hidden">
                  <img
                    src={facility.image || "/placeholder.svg"}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                  {!facility.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">Unavailable</Badge>
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-background/90 text-foreground">
                    {facilityTypes.find((t) => t.value === facility.type)?.label}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{facility.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {facility.capacity}
                        </span>
                        <span className="font-medium text-primary">£{facility.hourlyRate}/hr</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{facility.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditFacility(facility)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteFacility(facility.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {facility.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {facility.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{facility.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Pending Bookings</h2>
            <p className="text-sm text-muted-foreground">Review and approve booking requests</p>
          </div>

          <div className="space-y-4">
            {bookings.filter((b) => b.status === "pending").length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-4" />
                  <h3 className="font-medium text-foreground">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">No pending booking requests</p>
                </CardContent>
              </Card>
            ) : (
              bookings
                .filter((b) => b.status === "pending")
                .map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{booking.memberName}</h3>
                            <Badge variant="outline">{booking.facility}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.memberEmail}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1 text-foreground">
                              <Calendar className="w-4 h-4" />
                              {formatDate(booking.date)}
                            </span>
                            <span className="flex items-center gap-1 text-foreground">
                              <Clock className="w-4 h-4" />
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Requested: {booking.requestedAt}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                            onClick={() => handleBookingAction(booking.id, "reject")}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => handleBookingAction(booking.id, "approve")}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        {/* Mail Tab */}
        <TabsContent value="mail" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Virtual Mail</h2>
            <p className="text-sm text-muted-foreground">Process incoming mail for members</p>
          </div>

          <div className="space-y-4">
            {mail.filter((m) => m.status.startsWith("awaiting")).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-4" />
                  <h3 className="font-medium text-foreground">All mail processed!</h3>
                  <p className="text-sm text-muted-foreground">No pending mail items</p>
                </CardContent>
              </Card>
            ) : (
              mail
                .filter((m) => m.status.startsWith("awaiting"))
                .map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{item.memberName}</h3>
                            <Badge variant={item.type === "parcel" ? "default" : "secondary"}>{item.type}</Badge>
                            <Badge
                              variant="outline"
                              className={
                                item.status === "awaiting_scan"
                                  ? "border-yellow-500 text-yellow-600"
                                  : "border-blue-500 text-blue-600"
                              }
                            >
                              {item.status === "awaiting_scan" ? "Needs Scan" : "Awaiting Collection"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.memberEmail}</p>
                          <p className="text-sm text-foreground mt-2">From: {item.sender}</p>
                          <p className="text-xs text-muted-foreground mt-1">Received: {item.receivedAt}</p>
                        </div>
                        <div className="flex gap-2">
                          {item.status === "awaiting_scan" && (
                            <Button size="sm" onClick={() => handleMailAction(item.id, "scanned")}>
                              <Scan className="w-4 h-4 mr-1" />
                              Mark Scanned
                            </Button>
                          )}
                          {item.status === "awaiting_collection" && (
                            <Button size="sm" onClick={() => handleMailAction(item.id, "collected")}>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Mark Collected
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
