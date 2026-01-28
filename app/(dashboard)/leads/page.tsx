"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Edit, Search, Loader2, Phone, Mail, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Lead {
  id: string
  user_id: string | null
  client_name: string
  client_email: string
  client_phone: string
  project_type: string
  description: string
  location: string
  budget: string
  source: string
  status: string
  priority: string
  notes: string | null
  created_at: string
  assigned_to?: {
    full_name: string
    company_name: string
  }
}

interface Member {
  id: string
  full_name: string
  company_name: string
  email: string
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()
  const supabase = createClient()

  const [leadForm, setLeadForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    project_type: "",
    description: "",
    location: "",
    budget: "",
    source: "manual",
    status: "new",
    priority: "medium",
    notes: "",
    user_id: "",
  })

  useEffect(() => {
    loadLeads()
    loadMembers()
  }, [])

  async function loadLeads() {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          assigned_to:profiles!leads_user_id_fkey(full_name, company_name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error("Error loading leads:", error)
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadMembers() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, email")
        .in("role", ["member", "admin"])
        .eq("is_active", true)
        .order("full_name")

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error("Error loading members:", error)
    }
  }

  async function handleSubmit() {
    try {
      const leadData = {
        ...leadForm,
        user_id: leadForm.user_id || null,
      }

      if (editingLead) {
        const { error } = await supabase
          .from("leads")
          .update(leadData)
          .eq("id", editingLead.id)

        if (error) throw error
        toast({ title: "Success", description: "Lead updated successfully" })
      } else {
        const { error } = await supabase.from("leads").insert([leadData])

        if (error) throw error
        toast({ title: "Success", description: "Lead created successfully" })
      }

      setDialogOpen(false)
      resetForm()
      loadLeads()
    } catch (error) {
      console.error("Error saving lead:", error)
      toast({
        title: "Error",
        description: "Failed to save lead",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this lead?")) return

    try {
      const { error } = await supabase.from("leads").delete().eq("id", id)

      if (error) throw error
      toast({ title: "Success", description: "Lead deleted successfully" })
      loadLeads()
    } catch (error) {
      console.error("Error deleting lead:", error)
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      })
    }
  }

  function openEditDialog(lead: Lead) {
    setEditingLead(lead)
    setLeadForm({
      client_name: lead.client_name,
      client_email: lead.client_email,
      client_phone: lead.client_phone,
      project_type: lead.project_type,
      description: lead.description,
      location: lead.location,
      budget: lead.budget,
      source: lead.source,
      status: lead.status,
      priority: lead.priority,
      notes: lead.notes || "",
      user_id: lead.user_id || "",
    })
    setDialogOpen(true)
  }

  function resetForm() {
    setEditingLead(null)
    setLeadForm({
      client_name: "",
      client_email: "",
      client_phone: "",
      project_type: "",
      description: "",
      location: "",
      budget: "",
      source: "manual",
      status: "new",
      priority: "medium",
      notes: "",
      user_id: "",
    })
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.project_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "contacted":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "won":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "lost":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-muted"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-muted"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Leads Management</h1>
        <p className="text-muted-foreground">Manage and assign leads to members</p>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
              <DialogDescription>
                {editingLead ? "Update lead information" : "Create a new lead and assign to a member"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={leadForm.client_name}
                    onChange={(e) => setLeadForm({ ...leadForm, client_name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Type *</Label>
                  <Input
                    value={leadForm.project_type}
                    onChange={(e) => setLeadForm({ ...leadForm, project_type: e.target.value })}
                    placeholder="Kitchen Renovation"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={leadForm.client_email}
                    onChange={(e) => setLeadForm({ ...leadForm, client_email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={leadForm.client_phone}
                    onChange={(e) => setLeadForm({ ...leadForm, client_phone: e.target.value })}
                    placeholder="07700 900000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={leadForm.location}
                    onChange={(e) => setLeadForm({ ...leadForm, location: e.target.value })}
                    placeholder="Bristol BS1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Input
                    value={leadForm.budget}
                    onChange={(e) => setLeadForm({ ...leadForm, budget: e.target.value })}
                    placeholder="£5,000 - £10,000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={leadForm.description}
                  onChange={(e) => setLeadForm({ ...leadForm, description: e.target.value })}
                  placeholder="Project details..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={leadForm.status} onValueChange={(v) => setLeadForm({ ...leadForm, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={leadForm.priority} onValueChange={(v) => setLeadForm({ ...leadForm, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={leadForm.source} onValueChange={(v) => setLeadForm({ ...leadForm, source: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign to Member</Label>
                <Select value={leadForm.user_id} onValueChange={(v) => setLeadForm({ ...leadForm, user_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name} {member.company_name ? `(${member.company_name})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Internal notes..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingLead ? "Update Lead" : "Create Lead"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{lead.client_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lead.location}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{lead.project_type}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{lead.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.client_email && (
                          <p className="text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.client_email}
                          </p>
                        )}
                        {lead.client_phone && (
                          <p className="text-xs flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.client_phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-primary">{lead.budget}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(lead.priority)}>{lead.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      {lead.assigned_to ? (
                        <div>
                          <p className="text-sm font-medium">{lead.assigned_to.full_name}</p>
                          {lead.assigned_to.company_name && (
                            <p className="text-xs text-muted-foreground">{lead.assigned_to.company_name}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(lead)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(lead.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
