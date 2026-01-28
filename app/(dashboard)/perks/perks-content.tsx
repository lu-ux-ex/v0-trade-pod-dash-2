"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Clock, Copy, Check, ExternalLink, Bookmark, Plus, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const categories = ["All", "Supplies", "Software", "Insurance", "Finance", "Tools", "Services"]

interface Perk {
  id: string
  partner_name: string
  partner_id: string | null
  title: string
  description: string
  expiry_date: string | null
  is_featured: boolean
  category: string
  discount_code: string | null
  redemption_instructions: string
  logo_url: string | null
  status: string
  created_at: string
}

interface UserProfile {
  id: string
  role: "admin" | "member" | "partner"
  company_name: string
}

export default function PerksContent() {
  const supabase = createClient()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [perks, setPerks] = useState<Perk[]>([])
  const [myOffers, setMyOffers] = useState<Perk[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)
  
  // Partner-specific state
  const [addOfferOpen, setAddOfferOpen] = useState(false)
  const [requestEditOpen, setRequestEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    category: "",
    code: "",
    instructions: "",
    expiry: "",
  })
  const [editRequest, setEditRequest] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role, company_name")
        .eq("id", user.id)
        .single()

      if (profileData) {
        setProfile(profileData as UserProfile)
        
        // Load partner's own offers if they're a partner
        if (profileData.role === "partner") {
          const { data: myPerks } = await supabase
            .from("perks")
            .select("*")
            .eq("partner_id", user.id)
            .order("created_at", { ascending: false })
          
          if (myPerks) {
            setMyOffers(myPerks)
          }
        }
      }

      // Load all approved perks
      const { data: allPerks } = await supabase
        .from("perks")
        .select("*")
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })

      if (allPerks) {
        setPerks(allPerks)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPerks = perks.filter((perk) => {
    const matchesCategory = selectedCategory === "All" || perk.category === selectedCategory
    const matchesSearch =
      perk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perk.partner_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredPerks = filteredPerks.filter((p) => p.is_featured)
  const regularPerks = filteredPerks.filter((p) => !p.is_featured)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const formatExpiry = (date: string | null) => {
    if (!date) return "Ongoing"
    const d = new Date(date)
    return `Ends ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
  }

  const handleSubmitOffer = async () => {
    if (!profile || !newOffer.title || !newOffer.description || !newOffer.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("perks").insert({
        partner_id: profile.id,
        partner_name: profile.company_name || "Partner",
        title: newOffer.title,
        description: newOffer.description,
        category: newOffer.category,
        discount_code: newOffer.code || null,
        redemption_instructions: newOffer.instructions,
        expiry_date: newOffer.expiry || null,
        status: "pending",
        is_featured: false,
      })

      if (error) throw error
      
      toast({
        title: "Offer Submitted",
        description: "Your offer has been submitted for admin approval.",
      })
      setAddOfferOpen(false)
      setNewOffer({
        title: "",
        description: "",
        category: "",
        code: "",
        instructions: "",
        expiry: "",
      })
      loadData() // Reload data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit offer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestEdit = async () => {
    if (!selectedPerk || !editRequest.trim()) {
      toast({
        title: "Error",
        description: "Please describe the changes you'd like to make",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Create an edit request (stored in a separate field or table)
      const { error } = await supabase.from("perks").update({
        edit_request: editRequest,
        status: "edit_requested",
      }).eq("id", selectedPerk.id)

      if (error) throw error
      
      toast({
        title: "Edit Request Submitted",
        description: "Your edit request has been sent to the admin for review.",
      })
      setRequestEditOpen(false)
      setEditRequest("")
      setSelectedPerk(null)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit edit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const isPartner = profile?.role === "partner"

  return (
    <>
      {/* Partner-specific header */}
      {isPartner && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Partner Dashboard</CardTitle>
              <Button type="button" onClick={() => setAddOfferOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add An Offer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="my-offers">
              <TabsList>
                <TabsTrigger value="my-offers">My Offers ({myOffers.length})</TabsTrigger>
                <TabsTrigger value="all-deals">All Deals</TabsTrigger>
              </TabsList>
              <TabsContent value="my-offers" className="mt-4">
                {myOffers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't added any offers yet.</p>
                    <p className="text-sm mt-1">Click "Add An Offer" to create your first deal for TradePod members.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myOffers.map((offer) => (
                      <Card key={offer.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{offer.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
                              <Badge className="mt-2" variant={offer.status === "approved" ? "default" : "secondary"}>
                                {offer.status === "approved" ? "Live" : offer.status === "pending" ? "Pending Approval" : "Edit Requested"}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent"
                              type="button"
                              onClick={() => {
                                setSelectedPerk(offer)
                                setRequestEditOpen(true)
                              }}
                            >
                              Request Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="all-deals" className="mt-4">
                {/* Shows all deals below */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="perks-search"
            name="perks-search"
            placeholder="Search perks and partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((category) => (
            <Button
              key={category}
              type="button"
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory !== category ? "bg-transparent" : ""}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {perks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground">No deals available yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Check back soon for exclusive partner deals!</p>
          </CardContent>
        </Card>
      )}

      {/* Featured Perks */}
      {featuredPerks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Featured Deals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPerks.map((perk) => (
              <Card
                key={perk.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 border-2 border-primary/20"
                onClick={() => setSelectedPerk(perk)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={perk.logo_url || "/placeholder.svg"}
                      alt={perk.partner_name}
                      className="w-14 h-14 rounded-lg object-contain bg-muted p-2"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{perk.partner_name}</p>
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      </div>
                      <h3 className="font-semibold text-foreground mt-1">{perk.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{perk.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatExpiry(perk.expiry_date)}
                        </span>
                        <Badge variant="secondary">{perk.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Perks */}
      {regularPerks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularPerks.map((perk) => (
              <Card
                key={perk.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => setSelectedPerk(perk)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={perk.logo_url || "/placeholder.svg"}
                      alt={perk.partner_name}
                      className="w-12 h-12 rounded-lg object-contain bg-muted p-2"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{perk.partner_name}</p>
                      <h3 className="font-medium text-foreground mt-1">{perk.title}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatExpiry(perk.expiry_date)}
                        </span>
                        <Badge variant="secondary">{perk.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Perk Detail Dialog */}
      <Dialog open={!!selectedPerk && !requestEditOpen} onOpenChange={() => setSelectedPerk(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedPerk && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedPerk.logo_url || "/placeholder.svg"}
                    alt={selectedPerk.partner_name}
                    className="w-16 h-16 rounded-lg object-contain bg-muted p-2"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">{selectedPerk.partner_name}</p>
                    <DialogTitle className="text-xl">{selectedPerk.title}</DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              <DialogDescription className="text-foreground">{selectedPerk.description}</DialogDescription>

              <div className="space-y-4 mt-4">
                {selectedPerk.discount_code && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Discount Code</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-lg font-mono font-bold text-primary bg-background px-3 py-2 rounded border border-border">
                        {selectedPerk.discount_code}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyCode(selectedPerk.discount_code!)}
                        className="bg-transparent"
                      >
                        {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">How to Redeem</p>
                  <p className="text-sm text-muted-foreground">{selectedPerk.redemption_instructions || "Contact the partner directly to redeem this offer."}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatExpiry(selectedPerk.expiry_date)}
                  </span>
                  <Badge>{selectedPerk.category}</Badge>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button type="button" variant="outline" className="flex-1 bg-transparent">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Deal
                </Button>
                <Button type="button" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Partner
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Offer Dialog (Partners only) */}
      <Dialog open={addOfferOpen} onOpenChange={setAddOfferOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Offer</DialogTitle>
            <DialogDescription>
              Submit a new offer for TradePod members. Your offer will be reviewed by an admin before being published.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="offer-title">Offer Title *</Label>
              <Input
                id="offer-title"
                name="offer-title"
                placeholder="e.g., 20% Off First Order"
                value={newOffer.title}
                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-description">Description *</Label>
              <Textarea
                id="offer-description"
                name="offer-description"
                placeholder="Describe your offer..."
                value={newOffer.description}
                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offer-category">Category *</Label>
                <Select
                  value={newOffer.category}
                  onValueChange={(value) => setNewOffer({ ...newOffer, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-expiry">Expiry Date</Label>
                <Input
                  id="offer-expiry"
                  name="offer-expiry"
                  type="date"
                  value={newOffer.expiry}
                  onChange={(e) => setNewOffer({ ...newOffer, expiry: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-code">Discount Code (optional)</Label>
              <Input
                id="offer-code"
                name="offer-code"
                placeholder="e.g., TRADEPOD20"
                value={newOffer.code}
                onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-instructions">Redemption Instructions</Label>
              <Textarea
                id="offer-instructions"
                name="offer-instructions"
                placeholder="How should members redeem this offer?"
                value={newOffer.instructions}
                onChange={(e) => setNewOffer({ ...newOffer, instructions: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddOfferOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmitOffer} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Edit Dialog (Partners only) */}
      <Dialog open={requestEditOpen} onOpenChange={setRequestEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Edit</DialogTitle>
            <DialogDescription>
              Describe the changes you'd like to make to "{selectedPerk?.title}". An admin will review your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-request">Requested Changes</Label>
              <Textarea
                id="edit-request"
                name="edit-request"
                placeholder="Describe the changes you'd like to make..."
                value={editRequest}
                onChange={(e) => setEditRequest(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setRequestEditOpen(false)
              setEditRequest("")
            }} className="bg-transparent">
              Cancel
            </Button>
            <Button type="button" onClick={handleRequestEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
