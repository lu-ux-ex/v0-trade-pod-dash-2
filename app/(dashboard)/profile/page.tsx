"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Eye,
  Edit2,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Loader2,
  Plus,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const UK_COUNTIES = [
  "Bedfordshire",
  "Berkshire",
  "Bristol",
  "Buckinghamshire",
  "Cambridgeshire",
  "Cheshire",
  "City of London",
  "Cornwall",
  "Cumbria",
  "Derbyshire",
  "Devon",
  "Dorset",
  "Durham",
  "East Riding of Yorkshire",
  "East Sussex",
  "Essex",
  "Gloucestershire",
  "Greater London",
  "Greater Manchester",
  "Hampshire",
  "Herefordshire",
  "Hertfordshire",
  "Isle of Wight",
  "Kent",
  "Lancashire",
  "Leicestershire",
  "Lincolnshire",
  "Merseyside",
  "Norfolk",
  "North Somerset",
  "North Yorkshire",
  "Northamptonshire",
  "Northumberland",
  "Nottinghamshire",
  "Oxfordshire",
  "Rutland",
  "Shropshire",
  "Somerset",
  "South Gloucestershire",
  "South Yorkshire",
  "Staffordshire",
  "Suffolk",
  "Surrey",
  "Tyne and Wear",
  "Warwickshire",
  "West Midlands",
  "West Sussex",
  "West Yorkshire",
  "Wiltshire",
  "Worcestershire",
  // Scotland
  "Aberdeenshire",
  "Angus",
  "Argyll and Bute",
  "Clackmannanshire",
  "Dumfries and Galloway",
  "Dundee City",
  "East Ayrshire",
  "East Dunbartonshire",
  "East Lothian",
  "East Renfrewshire",
  "Edinburgh",
  "Falkirk",
  "Fife",
  "Glasgow",
  "Highland",
  "Inverclyde",
  "Midlothian",
  "Moray",
  "North Ayrshire",
  "North Lanarkshire",
  "Orkney Islands",
  "Perth and Kinross",
  "Renfrewshire",
  "Scottish Borders",
  "Shetland Islands",
  "South Ayrshire",
  "South Lanarkshire",
  "Stirling",
  "West Dunbartonshire",
  "West Lothian",
  // Wales
  "Anglesey",
  "Blaenau Gwent",
  "Bridgend",
  "Caerphilly",
  "Cardiff",
  "Carmarthenshire",
  "Ceredigion",
  "Conwy",
  "Denbighshire",
  "Flintshire",
  "Gwynedd",
  "Merthyr Tydfil",
  "Monmouthshire",
  "Neath Port Talbot",
  "Newport",
  "Pembrokeshire",
  "Powys",
  "Rhondda Cynon Taf",
  "Swansea",
  "Torfaen",
  "Vale of Glamorgan",
  "Wrexham",
  // Northern Ireland
  "Antrim",
  "Armagh",
  "Down",
  "Fermanagh",
  "Londonderry",
  "Tyrone",
].sort()

const TRADE_SERVICES = [
  "Plumbing",
  "Heating",
  "Gas Work",
  "Boiler Installation",
  "Boiler Repair",
  "Bathroom Installation",
  "Kitchen Plumbing",
  "Emergency Repairs",
  "Drain Cleaning",
  "Electrical Work",
  "Rewiring",
  "Fuse Box Installation",
  "Lighting Installation",
  "Security Systems",
  "EV Charger Installation",
  "Carpentry",
  "Joinery",
  "Kitchen Fitting",
  "Door Installation",
  "Window Installation",
  "Roofing",
  "Guttering",
  "Fascias & Soffits",
  "Chimney Repair",
  "Plastering",
  "Rendering",
  "Dry Lining",
  "Coving",
  "Painting",
  "Decorating",
  "Wallpapering",
  "Tiling",
  "Floor Tiling",
  "Wall Tiling",
  "Flooring",
  "Laminate Flooring",
  "Hardwood Flooring",
  "Carpet Fitting",
  "Bricklaying",
  "Blockwork",
  "Stonework",
  "Repointing",
  "Landscaping",
  "Fencing",
  "Decking",
  "Paving",
  "Driveways",
  "Building Work",
  "Extensions",
  "Conversions",
  "New Builds",
  "Damp Proofing",
  "Insulation",
  "Ventilation",
  "Locksmith",
  "CCTV Installation",
  "Alarm Systems",
  "General Maintenance",
  "Handyman Services",
].sort()

const COMMON_ACCREDITATIONS = [
  "Gas Safe Registered",
  "NICEIC Approved",
  "NAPIT Registered",
  "ELECSA Approved",
  "Part P Certified",
  "CIPHE Member",
  "APHC Member",
  "FMB Member",
  "TrustMark Registered",
  "Checkatrade Member",
  "Which? Trusted Trader",
  "City & Guilds Qualified",
  "NVQ Qualified",
  "Fully Insured",
  "Public Liability Insurance",
  "CSCS Card Holder",
  "SSIP Certified",
  "ISO 9001 Certified",
].sort()

interface ProfileData {
  id: string
  full_name: string
  company_name: string
  email: string
  phone: string
  bio: string
  website: string
  trade_type: string
  services: string[]
  service_areas: string[]
  avatar_url: string
  has_directory_listing: boolean
  location: string
  accreditations: string[]
  portfolio_photos: string[]
  role: "admin" | "member" | "partner"
}

export default function ProfilePage() {
  const supabase = createClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    company_name: "",
    phone: "",
    website: "",
    bio: "",
    trade_type: "",
  })
  const [location, setLocation] = useState("")
  const [services, setServices] = useState<string[]>([])
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [accreditations, setAccreditations] = useState<string[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error

        if (data) {
          setProfile(data)
          setFormData({
            full_name: data.full_name || "",
            company_name: data.company_name || "",
            phone: data.phone || "",
            website: data.website || "",
            bio: data.bio || "",
            trade_type: data.trade_type || "",
          })
          setLocation(data.location || "")
          setServices(data.services || [])
          setServiceAreas(data.service_areas || [])
          setAccreditations(data.accreditations || [])
          setPhotos(data.portfolio_photos || [])
          setAvatarUrl(data.avatar_url || "")
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [supabase, toast])

  const saveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          company_name: formData.company_name,
          phone: formData.phone,
          website: formData.website,
          bio: formData.bio,
          trade_type: formData.trade_type,
          location: location,
          services: services,
          service_areas: serviceAreas,
          accreditations: accreditations,
          portfolio_photos: photos,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile saved successfully",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: `Failed to save profile: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${profile.id}-avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      setAvatarUrl(publicUrl)

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Profile picture updated",
      })
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Error",
        description: `Failed to upload profile picture: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setIsUploadingPhoto(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("photos").upload(fileName, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(fileName)

      const newPhotos = [...photos, publicUrl]
      setPhotos(newPhotos)

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ portfolio_photos: newPhotos })
        .eq("id", profile.id)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast({
        title: "Error",
        description: `Failed to upload photo: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const removePhoto = async (photoUrl: string) => {
    const newPhotos = photos.filter((p) => p !== photoUrl)
    setPhotos(newPhotos)

    if (profile) {
      await supabase.from("profiles").update({ portfolio_photos: newPhotos }).eq("id", profile.id)
      toast({
        title: "Success",
        description: "Photo removed",
      })
    }
  }

  const calculateCompleteness = () => {
    let completed = 0
    const total = 10

    if (formData.company_name) completed++
    if (formData.full_name) completed++
    if (formData.phone) completed++
    if (formData.bio && formData.bio.split(" ").length >= 20) completed++
    if (services.length > 0) completed++
    if (serviceAreas.length > 0) completed++
    if (avatarUrl) completed++
    if (formData.website) completed++
    if (location) completed++
    if (accreditations.length > 0) completed++

    return Math.round((completed / total) * 100)
  }

  const completenessItems = [
    { label: "Business name", complete: !!formData.company_name },
    { label: "Contact name", complete: !!formData.full_name },
    { label: "Phone number", complete: !!formData.phone },
    { label: "Description (20+ words)", complete: formData.bio?.split(" ").length >= 20 },
    { label: "Services offered", complete: services.length > 0 },
    { label: "Service areas", complete: serviceAreas.length > 0 },
    { label: "Profile picture", complete: !!avatarUrl },
    { label: "Website", complete: !!formData.website },
    { label: "Location", complete: !!location },
    { label: "Accreditations", complete: accreditations.length > 0 },
  ]

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }

  const addService = (service: string) => {
    if (service && !services.includes(service)) {
      setServices([...services, service])
    }
  }

  const removeService = (service: string) => {
    setServices(services.filter((s) => s !== service))
  }

  const addServiceArea = (area: string) => {
    if (area && !serviceAreas.includes(area)) {
      setServiceAreas([...serviceAreas, area])
    }
  }

  const removeServiceArea = (area: string) => {
    setServiceAreas(serviceAreas.filter((a) => a !== area))
  }

  const addAccreditation = (acc: string) => {
    if (acc && !accreditations.includes(acc)) {
      setAccreditations([...accreditations, acc])
    }
  }

  const removeAccreditation = (acc: string) => {
    setAccreditations(accreditations.filter((a) => a !== acc))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const completeness = calculateCompleteness()

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Profile picture" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {formData.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "?"}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                id="avatar-upload"
                name="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                aria-label="Upload profile picture"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90"
                aria-label="Change profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      {formData.company_name || "Your Business Name"}
                    </h2>
                    {profile?.has_directory_listing && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" fill="currentColor" fillOpacity={0.2} />
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">{formData.full_name}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-transparent">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  {isEditing ? (
                    <Button onClick={saveProfile} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Profile Completeness
            <span className="text-primary">{completeness}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={completeness} className="h-2 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {completenessItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {item.complete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
                )}
                <span className={item.complete ? "text-muted-foreground" : "text-foreground"}>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partners only see contact info - simplified profile */}
      {profile?.role === "partner" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partner-company-name">Business Name</Label>
                <Input
                  id="partner-company-name"
                  name="partner-company-name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-full-name">Contact Name</Label>
                <Input
                  id="partner-full-name"
                  name="partner-full-name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="partner-phone"
                    name="partner-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="partner-email"
                    name="partner-email"
                    value={profile?.email || ""}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="partner-website"
                    name="partner-website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Business Details</TabsTrigger>
            <TabsTrigger value="services">Services & Areas</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="social">Social Proofing</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Business Name</Label>
                    <Input
                      id="company-name"
                      name="company-name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Owner/Contact Name</Label>
                    <Input
                      id="full-name"
                      name="full-name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email" name="email" value={profile?.email || ""} disabled className="pl-10 bg-muted" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select value={location} onValueChange={setLocation} disabled={!isEditing}>
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent>
                        {UK_COUNTIES.map((county) => (
                          <SelectItem key={county} value={county}>
                            {county}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Accreditations & Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {accreditations.map((acc) => (
                    <Badge key={acc} variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      {acc}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeAccreditation(acc)}
                          className="ml-1 hover:text-destructive"
                          aria-label={`Remove ${acc}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="add-accreditation">Add Accreditation</Label>
                    <Select onValueChange={addAccreditation}>
                      <SelectTrigger id="add-accreditation">
                        <SelectValue placeholder="Select accreditation to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_ACCREDITATIONS.filter((a) => !accreditations.includes(a)).map((acc) => (
                          <SelectItem key={acc} value={acc}>
                            {acc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Full Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="bio">About Your Business</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={6}
                  placeholder="Describe your business, experience, and what sets you apart..."
                />
                <p className="text-sm text-muted-foreground">
                  Word count: {getWordCount(formData.bio)}{" "}
                  {getWordCount(formData.bio) < 20 && "(minimum 20 words recommended)"}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Services Offered</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Badge key={service} variant="outline">
                      {service}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeService(service)}
                          className="ml-1 hover:text-destructive"
                          aria-label={`Remove ${service}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="add-service">Add Service</Label>
                    <Select onValueChange={addService}>
                      <SelectTrigger id="add-service">
                        <SelectValue placeholder="Select service to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRADE_SERVICES.filter((s) => !services.includes(s)).map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Service Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {serviceAreas.map((area) => (
                    <Badge key={area} variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {area}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeServiceArea(area)}
                          className="ml-1 hover:text-destructive"
                          aria-label={`Remove ${area}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="add-service-area">Add Service Area</Label>
                    <Select onValueChange={addServiceArea}>
                      <SelectTrigger id="add-service-area">
                        <SelectValue placeholder="Select area to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {UK_COUNTIES.filter((a) => !serviceAreas.includes(a)).map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Portfolio Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  ref={photoInputRef}
                  type="file"
                  id="photo-upload"
                  name="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  aria-label="Upload portfolio photo"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Portfolio photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removePhoto(photo)}
                          className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove photo ${index + 1}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      aria-label="Add new photo"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-8 h-8" />
                          <span className="text-sm">Add Photo</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                {photos.length === 0 && !isEditing && (
                  <p className="text-center text-muted-foreground py-8">
                    No photos uploaded yet. Click Edit Profile to add photos.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Social Proofing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">Coming Soon</p>
                  <p className="mt-2">This feature is under development and will be available in a future update.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
