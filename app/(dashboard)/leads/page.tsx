"use client"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  PoundSterling,
} from "lucide-react"

const leads = [
  {
    id: 1,
    title: "Kitchen Renovation",
    customer: "Sarah Mitchell",
    email: "sarah.m@email.com",
    phone: "07700 900123",
    location: "Bristol BS6",
    postcode: "BS6 5QT",
    status: "new",
    received: "2025-01-16T10:30:00",
    budget: "£8,000 - £12,000",
    description:
      "Looking for a complete kitchen renovation including new cabinets, worktops, and tiling. Current kitchen is 15 years old. Would like modern shaker style.",
    timeline: "Within 3 months",
    source: "TradePod Directory",
  },
  {
    id: 2,
    title: "Bathroom Refit",
    customer: "James Peterson",
    email: "james.p@email.com",
    phone: "07700 900456",
    location: "Bath BA1",
    postcode: "BA1 2BN",
    status: "contacted",
    received: "2025-01-15T14:00:00",
    budget: "£3,000 - £5,000",
    description: "Small bathroom needs complete refit. New suite, tiling, and possibly underfloor heating.",
    timeline: "1-2 months",
    source: "Get a Quote",
  },
  {
    id: 3,
    title: "Extension Work",
    customer: "Mike Thompson",
    email: "mike.t@email.com",
    phone: "07700 900789",
    location: "Bristol BS7",
    postcode: "BS7 8PQ",
    status: "new",
    received: "2025-01-16T07:15:00",
    budget: "£25,000+",
    description:
      "Single storey rear extension, approximately 4m x 5m. Need structural work, electrics, and plastering.",
    timeline: "6+ months",
    source: "TradePod Directory",
  },
  {
    id: 4,
    title: "Loft Conversion Quote",
    customer: "Emma Williams",
    email: "emma.w@email.com",
    phone: "07700 900321",
    location: "Bristol BS9",
    postcode: "BS9 3AG",
    status: "quoted",
    received: "2025-01-12T09:00:00",
    budget: "£30,000 - £40,000",
    description: "Dormer loft conversion with en-suite bathroom. Need carpentry, plumbing, electrics, and plastering.",
    timeline: "Within 6 months",
    source: "Referral",
  },
  {
    id: 5,
    title: "Emergency Plumbing",
    customer: "Robert Clarke",
    email: "rob.c@email.com",
    phone: "07700 900654",
    location: "Bristol BS3",
    postcode: "BS3 1QG",
    status: "won",
    received: "2025-01-10T16:45:00",
    budget: "£200 - £500",
    description: "Burst pipe in kitchen. Fixed and follow-up work for replacing old pipes.",
    timeline: "ASAP",
    source: "Get a Quote",
  },
  {
    id: 6,
    title: "Garden Wall Repair",
    customer: "Linda Foster",
    email: "linda.f@email.com",
    phone: "07700 900987",
    location: "Bristol BS4",
    postcode: "BS4 2EF",
    status: "lost",
    received: "2025-01-08T11:30:00",
    budget: "£1,000 - £2,000",
    description: "Retaining wall partially collapsed. Needs rebuilding, approximately 8m length.",
    timeline: "1-2 months",
    source: "TradePod Directory",
  },
]

const pipelineStats = {
  new: leads.filter((l) => l.status === "new").length,
  contacted: leads.filter((l) => l.status === "contacted").length,
  quoted: leads.filter((l) => l.status === "quoted").length,
  won: leads.filter((l) => l.status === "won").length,
  lost: leads.filter((l) => l.status === "lost").length,
  avgResponseTime: "2.5 hours",
  conversionRate: "34%",
}

export default function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<(typeof leads)[0] | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    return "Just now"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            New
          </Badge>
        )
      case "contacted":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
            <MessageSquare className="w-3 h-3 mr-1" />
            Contacted
          </Badge>
        )
      case "quoted":
        return (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            <PoundSterling className="w-3 h-3 mr-1" />
            Quoted
          </Badge>
        )
      case "won":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Won
          </Badge>
        )
      case "lost":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Lost
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredLeads = statusFilter === "all" ? leads : leads.filter((l) => l.status === statusFilter)

  return (
    <>
      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{pipelineStats.new}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">New</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{pipelineStats.contacted}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Contacted</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{pipelineStats.quoted}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">Quoted</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{pipelineStats.won}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Won</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{pipelineStats.lost}</p>
            <p className="text-xs text-red-600 dark:text-red-400">Lost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
              <Clock className="w-5 h-5 text-primary" />
              {pipelineStats.avgResponseTime}
            </p>
            <p className="text-xs text-muted-foreground">Avg Response</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5 text-green-600" />
              {pipelineStats.conversionRate}
            </p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All ({leads.length})</TabsTrigger>
            <TabsTrigger value="new">New ({pipelineStats.new})</TabsTrigger>
            <TabsTrigger value="contacted">Contacted</TabsTrigger>
            <TabsTrigger value="quoted">Quoted</TabsTrigger>
            <TabsTrigger value="won">Won</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={statusFilter} className="space-y-4">
          {filteredLeads.map((lead) => (
            <Card
              key={lead.id}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${lead.status === "new" ? "border-l-4 border-l-blue-500" : ""}`}
              onClick={() => {
                setSelectedLead(lead)
                setDetailOpen(true)
              }}
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground text-lg">{lead.title}</h3>
                      {getStatusBadge(lead.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {lead.customer}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {lead.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <PoundSterling className="w-4 h-4" />
                        {lead.budget}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{lead.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeSince(lead.received)}
                      </span>
                      <span>Source: {lead.source}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `tel:${lead.phone}`
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `mailto:${lead.email}`
                      }}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Lead Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-xl">{selectedLead.title}</DialogTitle>
                  {getStatusBadge(selectedLead.status)}
                </div>
                <DialogDescription>
                  Received {formatDate(selectedLead.received)} at {formatTime(selectedLead.received)} via{" "}
                  {selectedLead.source}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Customer Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Customer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedLead.customer}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedLead.phone}`} className="text-sm text-primary hover:underline">
                        {selectedLead.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${selectedLead.email}`} className="text-sm text-primary hover:underline">
                        {selectedLead.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedLead.location} ({selectedLead.postcode})
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <PoundSterling className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-primary">{selectedLead.budget}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Timeline: {selectedLead.timeline}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Job Description</h4>
                <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">{selectedLead.description}</p>
              </div>

              {/* Update Status */}
              <div className="mt-4 space-y-3">
                <Label>Update Status</Label>
                <Select defaultValue={selectedLead.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Add Note</Label>
                <Textarea placeholder="Add a note about this lead..." className="resize-none" />
              </div>

              <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                <Button variant="outline" className="bg-transparent flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="bg-transparent flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Customer
                </Button>
                <Button className="flex-1">Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
