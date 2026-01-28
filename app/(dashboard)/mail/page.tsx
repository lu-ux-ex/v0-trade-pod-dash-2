"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mail, FileText, Download, Eye, MapPin, Clock, Package, Inbox, Archive, Check } from "lucide-react"

const mailItems = [
  {
    id: 1,
    sender: "HMRC",
    description: "Tax correspondence - Self Assessment",
    status: "scanned",
    receivedDate: "2025-01-16",
    scannedDate: "2025-01-16",
    isNew: true,
    type: "letter",
    preview: "/official-letter-document.jpg",
  },
  {
    id: 2,
    sender: "Companies House",
    description: "Annual return confirmation letter",
    status: "scanned",
    receivedDate: "2025-01-15",
    scannedDate: "2025-01-15",
    isNew: true,
    type: "letter",
    preview: "/companies-house-letter.jpg",
  },
  {
    id: 3,
    sender: "AXA Insurance",
    description: "Policy renewal documents",
    status: "awaiting_scan",
    receivedDate: "2025-01-14",
    scannedDate: null,
    isNew: false,
    type: "package",
    preview: null,
  },
  {
    id: 4,
    sender: "Bristol City Council",
    description: "Business rates notice",
    status: "scanned",
    receivedDate: "2025-01-12",
    scannedDate: "2025-01-12",
    isNew: false,
    type: "letter",
    preview: "/council-letter-document.jpg",
  },
  {
    id: 5,
    sender: "Trade Supplier Ltd",
    description: "Catalogue and promotional materials",
    status: "collected",
    receivedDate: "2025-01-10",
    scannedDate: null,
    isNew: false,
    type: "package",
    preview: null,
  },
]

const businessAddress = {
  line1: "Unit 5, TradePod Business Hub",
  line2: "Industrial Estate",
  city: "Bristol",
  postcode: "BS1 4DJ",
  country: "United Kingdom",
}

export default function VirtualMailPage() {
  const [selectedMail, setSelectedMail] = useState<(typeof mailItems)[0] | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scanned":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <Check className="w-3 h-3 mr-1" />
            Scanned
          </Badge>
        )
      case "awaiting_scan":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Awaiting Scan
          </Badge>
        )
      case "collected":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <Package className="w-3 h-3 mr-1" />
            Collected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const newMailCount = mailItems.filter((m) => m.isNew).length
  const awaitingScanCount = mailItems.filter((m) => m.status === "awaiting_scan").length

  return (
    <>
      {/* Business Address Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Your Business Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm">
              <p className="font-medium text-foreground">{businessAddress.line1}</p>
              <p className="text-muted-foreground">{businessAddress.line2}</p>
              <p className="text-muted-foreground">
                {businessAddress.city}, {businessAddress.postcode}
              </p>
              <p className="text-muted-foreground">{businessAddress.country}</p>
            </div>
            <Button variant="outline" className="bg-transparent">
              Copy Address
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Inbox className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{newMailCount}</p>
            <p className="text-xs text-muted-foreground">New Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-foreground">{awaitingScanCount}</p>
            <p className="text-xs text-muted-foreground">Awaiting Scan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-6 h-6 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {mailItems.filter((m) => m.status === "scanned").length}
            </p>
            <p className="text-xs text-muted-foreground">Ready to View</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Archive className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">{mailItems.length}</p>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
      </div>

      {/* Mail List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Mail</TabsTrigger>
          <TabsTrigger value="new">New ({newMailCount})</TabsTrigger>
          <TabsTrigger value="scanned">Scanned</TabsTrigger>
          <TabsTrigger value="awaiting">Awaiting Scan</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {mailItems.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-colors hover:border-primary/50 ${item.isNew ? "border-l-4 border-l-primary" : ""}`}
              onClick={() => {
                setSelectedMail(item)
                if (item.status === "scanned") setPreviewOpen(true)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {item.type === "package" ? (
                      <Package className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{item.sender}</h3>
                          {item.isNew && <span className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Received: {formatDate(item.receivedDate)}</span>
                          {item.scannedDate && <span>Scanned: {formatDate(item.scannedDate)}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(item.status)}
                        {item.status === "scanned" && (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                        {item.status === "awaiting_scan" && (
                          <p className="text-xs text-muted-foreground">Usually within 24 hours</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="new" className="space-y-3">
          {mailItems
            .filter((m) => m.isNew)
            .map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer transition-colors hover:border-primary/50 border-l-4 border-l-primary"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.sender}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">Received: {formatDate(item.receivedDate)}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="scanned" className="space-y-3">
          {mailItems
            .filter((m) => m.status === "scanned")
            .map((item) => (
              <Card key={item.id} className="cursor-pointer transition-colors hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.sender}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="awaiting" className="space-y-3">
          {mailItems
            .filter((m) => m.status === "awaiting_scan")
            .map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.sender}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Received: {formatDate(item.receivedDate)} • Scan expected within 24 hours
                      </p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* Mail Actions Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Mail Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <FileText className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-medium text-foreground">Scan & Email</h4>
              <p className="text-sm text-muted-foreground mt-1">
                We scan your mail and email you a PDF copy within 24 hours of receipt.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Package className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-medium text-foreground">Collect in Person</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Pick up physical mail during reception hours: Mon-Fri, 8am-6pm.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Mail className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-medium text-foreground">Forward Mail</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Request forwarding to another address (additional charges apply).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMail?.sender}</DialogTitle>
            <DialogDescription>{selectedMail?.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedMail?.preview && (
              <img
                src={selectedMail.preview || "/placeholder.svg"}
                alt="Mail preview"
                className="w-full rounded-lg border border-border"
              />
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button>Mark as Read</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
