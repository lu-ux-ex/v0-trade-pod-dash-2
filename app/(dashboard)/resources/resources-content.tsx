"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, Download, Bookmark, BookmarkCheck, FolderOpen, Eye, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Resource {
  id: string
  title: string
  description: string
  file_type: string
  file_size: string
  file_url: string
  category: string
  downloads: number
  is_published: boolean
  created_at: string
}

const categories = ["All", "Templates", "Compliance", "Tools", "Guides", "Legal"]

export default function ResourcesContent() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [savedResources, setSavedResources] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadResources()
    // Load saved resources from localStorage
    const saved = localStorage.getItem("savedResources")
    if (saved) {
      setSavedResources(JSON.parse(saved))
    }
  }, [])

  const loadResources = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setResources(data)
    }
    setLoading(false)
  }

  const handleDownload = async (resource: Resource) => {
    // Increment download count
    await supabase
      .from("resources")
      .update({ downloads: (resource.downloads || 0) + 1 })
      .eq("id", resource.id)

    // Update local state
    setResources(resources.map(r => 
      r.id === resource.id ? { ...r, downloads: (r.downloads || 0) + 1 } : r
    ))

    // Open the file URL
    if (resource.file_url) {
      window.open(resource.file_url, "_blank")
    }
  }

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === "All" || selectedCategory === "saved" || resource.category === selectedCategory
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleSaved = (id: string) => {
    const newSaved = savedResources.includes(id) 
      ? savedResources.filter((r) => r !== id) 
      : [...savedResources, id]
    setSavedResources(newSaved)
    localStorage.setItem("savedResources", JSON.stringify(newSaved))
  }

  const getFileIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "PDF":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      case "XLSX":
      case "XLS":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      case "DOCX":
      case "DOC":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Check if resource is new (created within last 7 days)
  const isNew = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="search-resources"
          name="search-resources"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
          <TabsTrigger value="saved" className="ml-auto">
            <Bookmark className="w-4 h-4 mr-1" />
            Saved ({savedResources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {selectedCategory !== "saved" ? (
            <>
              {/* New Resources */}
              {filteredResources.filter((r) => isNew(r.created_at)).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">Recently Added</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources
                      .filter((r) => isNew(r.created_at))
                      .map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          isNew={true}
                          isSaved={savedResources.includes(resource.id)}
                          onToggleSaved={() => toggleSaved(resource.id)}
                          onDownload={() => handleDownload(resource)}
                          getFileIcon={getFileIcon}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* All Resources */}
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">All Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources
                    .filter((r) => !isNew(r.created_at))
                    .map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        isNew={false}
                        isSaved={savedResources.includes(resource.id)}
                        onToggleSaved={() => toggleSaved(resource.id)}
                        onDownload={() => handleDownload(resource)}
                        getFileIcon={getFileIcon}
                      />
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources
                .filter((r) => savedResources.includes(r.id))
                .map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isNew={isNew(resource.created_at)}
                    isSaved={true}
                    onToggleSaved={() => toggleSaved(resource.id)}
                    onDownload={() => handleDownload(resource)}
                    getFileIcon={getFileIcon}
                  />
                ))}
            </div>
          )}

          {filteredResources.length === 0 && selectedCategory !== "saved" && (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-foreground">No resources found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or category</p>
              </CardContent>
            </Card>
          )}

          {selectedCategory === "saved" && savedResources.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-foreground">No saved resources</h3>
                <p className="text-sm text-muted-foreground mt-1">Bookmark resources to access them quickly later</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ResourceCard({
  resource,
  isNew,
  isSaved,
  onToggleSaved,
  onDownload,
  getFileIcon,
}: {
  resource: Resource
  isNew: boolean
  isSaved: boolean
  onToggleSaved: () => void
  onDownload: () => void
  getFileIcon: (type: string) => string
}) {
  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getFileIcon(resource.file_type)}`}
          >
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground text-sm">{resource.title}</h3>
                  {isNew && (
                    <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSaved()
                }}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                ) : (
                  <Bookmark className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {resource.file_type?.toUpperCase() || "FILE"}
                </Badge>
                <span>{resource.file_size || "N/A"}</span>
                <span>{resource.downloads || 0} downloads</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-transparent"
                type="button"
                onClick={() => resource.file_url && window.open(resource.file_url, "_blank")}
              >
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button 
                size="icon" 
                className="h-8 w-8 shrink-0"
                type="button"
                onClick={onDownload}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
