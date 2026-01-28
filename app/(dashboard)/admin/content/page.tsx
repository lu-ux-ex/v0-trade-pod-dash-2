"use client"

import { useState, useEffect } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Megaphone,
  Calendar,
  FileText,
  Gift,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Upload,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Announcement {
  id: string
  title: string
  content: string
  announcement_type: string
  target_roles: string[]
  is_published: boolean
  publish_date: string
  expiry_date: string | null
  cta_text: string | null
  cta_link: string | null
  created_at: string
}

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  location: string
  capacity: number
  event_type: string
  is_published: boolean
  visible_to_members: boolean
  visible_to_partners: boolean
  created_at: string
}

interface Resource {
  id: string
  title: string
  description: string
  category: string
  file_url: string
  file_type: string
  file_size: string
  target_roles: string[]
  is_published: boolean
  download_count: number
  created_at: string
}

interface Perk {
  id: string
  title: string
  description: string
  partner_name: string
  partner_id: string | null
  category: string
  discount_value: string
  discount_code: string | null
  terms: string | null
  valid_until: string | null
  is_active: boolean
  is_featured: boolean
  redemption_count: number
  created_at: string
}

interface CommunityPost {
  id: string
  title: string
  content: string
  category: string
  user_id: string
  is_approved: boolean
  created_at: string
  profiles?: {
    full_name: string
    company_name: string
  }
}

export default function ContentManagerPage() {
  const { toast } = useToast()
  const supabase = createClient()
  
  // State for all content types
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [perks, setPerks] = useState<Perk[]>([])
  const [pendingPosts, setPendingPosts] = useState<CommunityPost[]>([])
  const [pendingPerks, setPendingPerks] = useState<Perk[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Dialog states
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false)
  const [perkDialogOpen, setPerkDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    announcement_type: "general",
    target_roles: ["admin", "member", "partner"],
    is_published: true,
    expiry_date: "",
    cta_text: "",
    cta_link: "",
  })
  
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    capacity: 20,
    event_type: "networking",
    is_published: true,
    visible_to_members: true,
    visible_to_partners: false,
  })
  
  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    category: "Templates",
    file_url: "",
    file_type: "PDF",
    file_size: "",
    target_roles: ["admin", "member"],
    is_published: true,
  })
  
  const [perkForm, setPerkForm] = useState({
    title: "",
    description: "",
    partner_name: "",
    category: "Tools",
    discount_value: "",
    discount_code: "",
    terms: "",
    valid_until: "",
    is_active: true,
    is_featured: false,
  })
  
  const [resourceFile, setResourceFile] = useState<File | null>(null)
  const [eventImageFile, setEventImageFile] = useState<File | null>(null)

  // Load all data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // Load announcements
      const { data: announcementsData } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
      setAnnouncements(announcementsData || [])

      // Load events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true })
      setEvents(eventsData || [])

      // Load resources
      const { data: resourcesData } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false })
      setResources(resourcesData || [])

      // Load perks (approved ones)
      const { data: perksData } = await supabase
        .from("perks")
        .select("*")
        .order("created_at", { ascending: false })
      setPerks(perksData || [])

      // Load pending community posts (posts without is_approved or is_approved = false)
      // Note: We'll add is_approved column if it doesn't exist
      const { data: postsData } = await supabase
        .from("community_posts")
        .select("*, profiles(full_name, company_name)")
        .order("created_at", { ascending: false })
      // Filter for unapproved posts client-side for now
      setPendingPosts((postsData || []).filter((p: any) => !p.is_pinned))

    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load content data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Announcement handlers
  const handleSaveAnnouncement = async () => {
    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      const announcementData = {
        title: announcementForm.title,
        content: announcementForm.content,
        announcement_type: announcementForm.announcement_type,
        target_roles: announcementForm.target_roles,
        is_published: announcementForm.is_published,
        publish_date: new Date().toISOString(),
        expiry_date: announcementForm.expiry_date || null,
        cta_text: announcementForm.cta_text || null,
        cta_link: announcementForm.cta_link || null,
        created_by: userData.user?.id,
      }

      if (editingItem) {
        const { error } = await supabase
          .from("announcements")
          .update(announcementData)
          .eq("id", editingItem.id)
        if (error) throw error
        toast({ title: "Announcement Updated", description: "The announcement has been updated." })
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert(announcementData)
        if (error) throw error
        toast({ title: "Announcement Created", description: "The announcement has been published." })
      }

      setAnnouncementDialogOpen(false)
      resetAnnouncementForm()
      loadAllData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id)
      if (error) throw error
      toast({ title: "Deleted", description: "Announcement has been deleted." })
      loadAllData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: "",
      content: "",
      announcement_type: "general",
      target_roles: ["admin", "member", "partner"],
      is_published: true,
      expiry_date: "",
      cta_text: "",
      cta_link: "",
    })
    setEditingItem(null)
  }

  // Event handlers
  const handleSaveEvent = async () => {
    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      let imageUrl = editingItem?.image_url || null
      
      // Upload event image if selected
      if (eventImageFile) {
        const fileExt = eventImageFile.name.split('.').pop()
        const fileName = `event-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(fileName, eventImageFile)
        
        if (uploadError) {
          console.log("[v0] Upload error, attempting to create bucket:", uploadError)
        } else {
          const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName)
          imageUrl = urlData.publicUrl
        }
      }
      
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        event_date: eventForm.event_date,
        start_time: eventForm.start_time,
        end_time: eventForm.end_time,
        location: eventForm.location,
        capacity: eventForm.capacity,
        max_capacity: eventForm.capacity,
        event_type: eventForm.event_type,
        is_published: eventForm.is_published,
        visible_to_members: eventForm.visible_to_members,
        visible_to_partners: eventForm.visible_to_partners,
        attendees: editingItem?.attendees || 0,
        image_url: imageUrl,
        created_by: userData.user?.id,
      }

      if (editingItem) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingItem.id)
        if (error) throw error
        toast({ title: "Event Updated", description: "The event has been updated." })
      } else {
        const { error } = await supabase
          .from("events")
          .insert(eventData)
        if (error) throw error
        toast({ title: "Event Created", description: "The event has been added." })
      }

      setEventDialogOpen(false)
      resetEventForm()
      loadAllData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id)
      if (error) throw error
      toast({ title: "Deleted", description: "Event has been deleted." })
      loadAllData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      event_date: "",
      start_time: "",
      end_time: "",
      location: "",
      capacity: 20,
      event_type: "networking",
      is_published: true,
      visible_to_members: true,
      visible_to_partners: false,
    })
    setEventImageFile(null)
    setEditingItem(null)
  }

  // Resource handlers
  const handleSaveResource = async () => {
    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      let fileUrl = resourceForm.file_url
      let fileSize = resourceForm.file_size
      
      // Upload file if selected
      if (resourceFile) {
        const fileExt = resourceFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resources")
          .upload(fileName, resourceFile)
        
        if (uploadError) {
          // Create bucket if it doesn't exist
          await supabase.storage.createBucket("resources", { public: true })
          const { error: retryError } = await supabase.storage
            .from("resources")
            .upload(fileName, resourceFile)
          if (retryError) throw retryError
        }
        
        const { data: urlData } = supabase.storage.from("resources").getPublicUrl(fileName)
        fileUrl = urlData.publicUrl
        fileSize = `${(resourceFile.size / 1024).toFixed(0)} KB`
      }
      
      const resourceData = {
        title: resourceForm.title,
        description: resourceForm.description,
        category: resourceForm.category,
        file_url: fileUrl,
        file_type: resourceForm.file_type,
        file_size: fileSize,
        target_roles: resourceForm.target_roles,
        is_published: resourceForm.is_published,
        created_by: userData.user?.id,
        download_count: 0,
      }

      if (editingItem) {
        const { error } = await supabase
          .from("resources")
          .update(resourceData)
          .eq("id", editingItem.id)
        if (error) throw error
        toast({ title: "Resource Updated", description: "The resource has been updated." })
      } else {
        const { error } = await supabase
          .from("resources")
          .insert(resourceData)
        if (error) throw error
        toast({ title: "Resource Added", description: "The resource has been added." })
      }

      setResourceDialogOpen(false)
      resetResourceForm()
      loadAllData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteResource = async (id: string) => {
    try {
      const { error } = await supabase.from("resources").delete().eq("id", id)
      if (error) throw error
      toast({ title: "Deleted", description: "Resource has been deleted." })
      loadAllData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const resetResourceForm = () => {
    setResourceForm({
      title: "",
      description: "",
      category: "Templates",
      file_url: "",
      file_type: "PDF",
      file_size: "",
      target_roles: ["admin", "member"],
      is_published: true,
    })
    setResourceFile(null)
    setEditingItem(null)
  }

  // Perk/Deal handlers
  const handleSavePerk = async () => {
    setSaving(true)
    try {
      const perkData = {
        title: perkForm.title,
        description: perkForm.description,
        partner_name: perkForm.partner_name,
        category: perkForm.category,
        discount_value: perkForm.discount_value,
        discount_code: perkForm.discount_code || null,
        terms: perkForm.terms || null,
        valid_until: perkForm.valid_until || null,
        is_active: perkForm.is_active,
        is_featured: perkForm.is_featured,
        redemption_count: 0,
      }

      if (editingItem) {
        const { error } = await supabase
          .from("perks")
          .update(perkData)
          .eq("id", editingItem.id)
        if (error) throw error
        toast({ title: "Deal Updated", description: "The deal has been updated." })
      } else {
        const { error } = await supabase
          .from("perks")
          .insert(perkData)
        if (error) throw error
        toast({ title: "Deal Added", description: "The deal has been added." })
      }

      setPerkDialogOpen(false)
      resetPerkForm()
      loadAllData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePerk = async (id: string) => {
    try {
      const { error } = await supabase.from("perks").delete().eq("id", id)
      if (error) throw error
      toast({ title: "Deleted", description: "Deal has been deleted." })
      loadAllData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const resetPerkForm = () => {
    setPerkForm({
      title: "",
      description: "",
      partner_name: "",
      category: "Tools",
      discount_value: "",
      discount_code: "",
      terms: "",
      valid_until: "",
      is_active: true,
      is_featured: false,
    })
    setEditingItem(null)
  }

  // Community post approval handlers
  const handleApprovePost = async (post: CommunityPost) => {
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_pinned: true }) // Using is_pinned as approval status for now
        .eq("id", post.id)
      if (error) throw error
      toast({ title: "Post Approved", description: "The community post has been published." })
      loadAllData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleRejectPost = async (post: CommunityPost) => {
    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", post.id)
      if (error) throw error
      toast({ title: "Post Rejected", description: "The community post has been removed." })
      loadAllData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  // Edit item helpers
  const openEditAnnouncement = (item: Announcement) => {
    setAnnouncementForm({
      title: item.title,
      content: item.content,
      announcement_type: item.announcement_type,
      target_roles: item.target_roles || ["admin", "member", "partner"],
      is_published: item.is_published,
      expiry_date: item.expiry_date || "",
      cta_text: item.cta_text || "",
      cta_link: item.cta_link || "",
    })
    setEditingItem(item)
    setAnnouncementDialogOpen(true)
  }

  const openEditEvent = (item: Event) => {
    setEventForm({
      title: item.title,
      description: item.description || "",
      event_date: item.event_date,
      start_time: item.start_time,
      end_time: item.end_time || "",
      location: item.location,
      capacity: item.capacity,
      event_type: item.event_type || "networking",
      is_published: item.is_published,
      visible_to_members: true,
      visible_to_partners: false,
    })
    setEditingItem(item)
    setEventDialogOpen(true)
  }

  const openEditResource = (item: Resource) => {
    setResourceForm({
      title: item.title,
      description: item.description || "",
      category: item.category,
      file_url: item.file_url,
      file_type: item.file_type,
      file_size: item.file_size || "",
      target_roles: item.target_roles || ["admin", "member"],
      is_published: item.is_published,
    })
    setEditingItem(item)
    setResourceDialogOpen(true)
  }

  const openEditPerk = (item: Perk) => {
    setPerkForm({
      title: item.title,
      description: item.description || "",
      partner_name: item.partner_name,
      category: item.category,
      discount_value: item.discount_value,
      discount_code: item.discount_code || "",
      terms: item.terms || "",
      valid_until: item.valid_until || "",
      is_active: item.is_active,
      is_featured: item.is_featured,
    })
    setEditingItem(item)
    setPerkDialogOpen(true)
  }

  const totalPending = pendingPosts.length + pendingPerks.length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Approval Queue Summary */}
      {totalPending > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            You have {totalPending} item{totalPending > 1 ? "s" : ""} awaiting approval.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="announcements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approvals
            {totalPending > 0 && (
              <Badge variant="destructive" className="ml-1">{totalPending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Deals
          </TabsTrigger>
        </TabsList>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Pending Community Posts ({pendingPosts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No pending posts</p>
              ) : (
                pendingPosts.map(post => (
                  <div key={post.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {post.profiles?.full_name?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{post.profiles?.full_name || "Unknown"}</span>
                          <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                        </div>
                        <p className="font-medium text-sm mt-1">{post.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{post.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted: {new Date(post.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectPost(post)}
                        className="text-red-600 bg-transparent"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleApprovePost(post)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Announcements ({announcements.length})</h2>
            <Dialog open={announcementDialogOpen} onOpenChange={(open) => {
              setAnnouncementDialogOpen(open)
              if (!open) resetAnnouncementForm()
            }}>
              <DialogTrigger asChild>
                <Button type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit" : "Create"} Announcement</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update the announcement details" : "Create a new announcement for members"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="announcement-title">Title *</Label>
                    <Input
                      id="announcement-title"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      placeholder="Announcement title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="announcement-content">Content *</Label>
                    <Textarea
                      id="announcement-content"
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      placeholder="Announcement content"
                      className="min-h-24"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={announcementForm.announcement_type}
                        onValueChange={(value) => setAnnouncementForm({ ...announcementForm, announcement_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={announcementForm.expiry_date}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, expiry_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="announcement-published">Publish Immediately</Label>
                    <Switch
                      id="announcement-published"
                      checked={announcementForm.is_published}
                      onCheckedChange={(checked) => setAnnouncementForm({ ...announcementForm, is_published: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setAnnouncementDialogOpen(false)
                    resetAnnouncementForm()
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAnnouncement} disabled={saving || !announcementForm.title || !announcementForm.content}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No announcements yet. Create your first announcement above.
                </CardContent>
              </Card>
            ) : (
              announcements.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant={item.is_published ? "default" : "secondary"}>
                            {item.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(item.created_at).toLocaleDateString()}
                          {item.expiry_date && ` | Expires: ${new Date(item.expiry_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEditAnnouncement(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteAnnouncement(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Events ({events.length})</h2>
            <Dialog open={eventDialogOpen} onOpenChange={(open) => {
              setEventDialogOpen(open)
              if (!open) resetEventForm()
            }}>
              <DialogTrigger asChild>
                <Button type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit" : "Create"} Event</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update the event details" : "Create a new event"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Title *</Label>
                    <Input
                      id="event-title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Event title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Event description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Date *</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={eventForm.event_date}
                        onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-location">Location *</Label>
                      <Input
                        id="event-location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        placeholder="e.g., TradePod Lounge"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-start">Start Time *</Label>
                      <Input
                        id="event-start"
                        type="time"
                        value={eventForm.start_time}
                        onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-end">End Time</Label>
                      <Input
                        id="event-end"
                        type="time"
                        value={eventForm.end_time}
                        onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-capacity">Capacity</Label>
                      <Input
                        id="event-capacity"
                        type="number"
                        value={eventForm.capacity}
                        onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) || 20 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Event Type</Label>
                      <Select
                        value={eventForm.event_type}
                        onValueChange={(value) => setEventForm({ ...eventForm, event_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-image">Event Image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="event-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEventImageFile(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                    </div>
                    {eventImageFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {eventImageFile.name}
                      </p>
                    )}
                    {editingItem?.image_url && !eventImageFile && (
                      <p className="text-xs text-muted-foreground">Current image will be kept</p>
                    )}
                  </div>
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <Label>Visible to Members</Label>
    <Switch
      checked={eventForm.visible_to_members}
      onCheckedChange={(checked) => setEventForm({ ...eventForm, visible_to_members: checked })}
    />
  </div>
  <div className="flex items-center justify-between">
    <Label>Visible to Partners</Label>
    <Switch
      checked={eventForm.visible_to_partners}
      onCheckedChange={(checked) => setEventForm({ ...eventForm, visible_to_partners: checked })}
    />
  </div>
  <div className="flex items-center justify-between">
    <Label>Visible to Free Members</Label>
    <Switch
      checked={eventForm.visible_to_directory_members}
      onCheckedChange={(checked) => setEventForm({ ...eventForm, visible_to_directory_members: checked })}
    />
  </div>
  <div className="flex items-center justify-between">
    <Label>Published</Label>
    <Switch
      checked={eventForm.is_published}
      onCheckedChange={(checked) => setEventForm({ ...eventForm, is_published: checked })}
    />
  </div>
</div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setEventDialogOpen(false)
                    resetEventForm()
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEvent} disabled={saving || !eventForm.title || !eventForm.event_date || !eventForm.location}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No events yet. Create your first event above.
                </CardContent>
              </Card>
            ) : (
              events.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant={item.is_published ? "default" : "secondary"}>
                            {item.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(item.event_date).toLocaleDateString()} at {item.start_time} | {item.location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Capacity: {item.capacity}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEditEvent(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteEvent(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Resources ({resources.length})</h2>
            <Dialog open={resourceDialogOpen} onOpenChange={(open) => {
              setResourceDialogOpen(open)
              if (!open) resetResourceForm()
            }}>
              <DialogTrigger asChild>
                <Button type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit" : "Add"} Resource</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update the resource details" : "Upload a new resource for members"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="resource-title">Title *</Label>
                    <Input
                      id="resource-title"
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                      placeholder="Resource title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resource-description">Description</Label>
                    <Textarea
                      id="resource-description"
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={resourceForm.category}
                        onValueChange={(value) => setResourceForm({ ...resourceForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Templates">Templates</SelectItem>
                          <SelectItem value="Compliance">Compliance</SelectItem>
                          <SelectItem value="Guides">Guides</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>File Type</Label>
                      <Select
                        value={resourceForm.file_type}
                        onValueChange={(value) => setResourceForm({ ...resourceForm, file_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="DOCX">Word Document</SelectItem>
                          <SelectItem value="XLSX">Excel</SelectItem>
                          <SelectItem value="ZIP">ZIP Archive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resource-file">Upload File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="resource-file"
                        type="file"
                        onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                    </div>
                    {resourceFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {resourceFile.name} ({(resourceFile.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                    {editingItem && !resourceFile && resourceForm.file_url && (
                      <p className="text-xs text-muted-foreground">
                        Current file: {resourceForm.file_url.split('/').pop()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Published</Label>
                    <Switch
                      checked={resourceForm.is_published}
                      onCheckedChange={(checked) => setResourceForm({ ...resourceForm, is_published: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setResourceDialogOpen(false)
                    resetResourceForm()
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveResource} disabled={saving || !resourceForm.title || (!resourceFile && !editingItem)}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {editingItem ? "Update" : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {resources.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No resources yet. Upload your first resource above.
                </CardContent>
              </Card>
            ) : (
              resources.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge variant="outline">{item.file_type}</Badge>
                            <Badge variant={item.is_published ? "default" : "secondary"}>
                              {item.is_published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.category} | {item.download_count || 0} downloads</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEditResource(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteResource(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Deals & Offers ({perks.length})</h2>
            <Dialog open={perkDialogOpen} onOpenChange={(open) => {
              setPerkDialogOpen(open)
              if (!open) resetPerkForm()
            }}>
              <DialogTrigger asChild>
                <Button type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit" : "Add"} Deal</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update the deal details" : "Create a new deal or offer"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label htmlFor="perk-title">Title *</Label>
                    <Input
                      id="perk-title"
                      value={perkForm.title}
                      onChange={(e) => setPerkForm({ ...perkForm, title: e.target.value })}
                      placeholder="e.g., 15% Off Trade Account"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perk-partner">Partner Name *</Label>
                    <Input
                      id="perk-partner"
                      value={perkForm.partner_name}
                      onChange={(e) => setPerkForm({ ...perkForm, partner_name: e.target.value })}
                      placeholder="e.g., Screwfix"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perk-description">Description *</Label>
                    <Textarea
                      id="perk-description"
                      value={perkForm.description}
                      onChange={(e) => setPerkForm({ ...perkForm, description: e.target.value })}
                      placeholder="Describe the offer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={perkForm.category}
                        onValueChange={(value) => setPerkForm({ ...perkForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tools">Tools</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                          <SelectItem value="Banking">Banking</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="perk-discount">Discount Value *</Label>
                      <Input
                        id="perk-discount"
                        value={perkForm.discount_value}
                        onChange={(e) => setPerkForm({ ...perkForm, discount_value: e.target.value })}
                        placeholder="e.g., 15% or £50 off"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="perk-code">Discount Code</Label>
                      <Input
                        id="perk-code"
                        value={perkForm.discount_code}
                        onChange={(e) => setPerkForm({ ...perkForm, discount_code: e.target.value })}
                        placeholder="e.g., TRADEPOD15"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="perk-expiry">Valid Until</Label>
                      <Input
                        id="perk-expiry"
                        type="date"
                        value={perkForm.valid_until}
                        onChange={(e) => setPerkForm({ ...perkForm, valid_until: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perk-terms">Terms & Conditions</Label>
                    <Textarea
                      id="perk-terms"
                      value={perkForm.terms}
                      onChange={(e) => setPerkForm({ ...perkForm, terms: e.target.value })}
                      placeholder="Any terms or conditions"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Active</Label>
                      <Switch
                        checked={perkForm.is_active}
                        onCheckedChange={(checked) => setPerkForm({ ...perkForm, is_active: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Featured</Label>
                      <Switch
                        checked={perkForm.is_featured}
                        onCheckedChange={(checked) => setPerkForm({ ...perkForm, is_featured: checked })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setPerkDialogOpen(false)
                    resetPerkForm()
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePerk} disabled={saving || !perkForm.title || !perkForm.partner_name || !perkForm.description || !perkForm.discount_value}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingItem ? "Update" : "Add Deal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {perks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No deals yet. Add your first deal above.
                </CardContent>
              </Card>
            ) : (
              perks.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {item.is_featured && <Badge variant="outline">Featured</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.partner_name} | {item.category}</p>
                        <p className="text-sm mt-1">{item.discount_value}</p>
                        {item.discount_code && (
                          <Badge variant="outline" className="mt-1">Code: {item.discount_code}</Badge>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {item.redemption_count || 0} redemptions
                          {item.valid_until && ` | Expires: ${new Date(item.valid_until).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEditPerk(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleDeletePerk(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
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
