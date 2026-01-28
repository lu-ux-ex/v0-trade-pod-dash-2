"use client"

import React from "react"

import { useState, useEffect } from "react"
import { FileText, Download, FolderOpen, Loader2 } from "lucide-react"
import { WidgetCard } from "@/components/dashboard/widget-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Resource {
  id: string
  title: string
  description: string
  file_type: string
  file_url: string
  download_count: number
  category: string
  created_at: string
}

export function ResourcesWidget() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadResources() {
      try {
        const { data, error } = await supabase
          .from("resources")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3)
        
        if (error) throw error
        setResources(data || [])
      } catch (error) {
        console.error("Error loading resources:", error)
      } finally {
        setLoading(false)
      }
    }
    loadResources()
  }, [])

  const handleDownload = async (resource: Resource, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Increment download count
    await supabase
      .from("resources")
      .update({ download_count: (resource.download_count || 0) + 1 })
      .eq("id", resource.id)
    
    // Update local state
    setResources(resources.map(r => 
      r.id === resource.id ? { ...r, download_count: (r.download_count || 0) + 1 } : r
    ))
    
    // Open the file URL
    if (resource.file_url) {
      window.open(resource.file_url, "_blank")
    }
  }

  // Check if resource is new (created in last 7 days)
  const isNew = (dateString: string) => {
    const created = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - created.getTime()) / 86400000)
    return diffDays <= 7
  }

  if (loading) {
    return (
      <WidgetCard title="Resource Centre" icon={FolderOpen} action={{ label: "Browse All", href: "/resources" }}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </WidgetCard>
    )
  }

  if (resources.length === 0) {
    return (
      <WidgetCard title="Resource Centre" icon={FolderOpen} action={{ label: "Browse All", href: "/resources" }}>
        <div className="py-8 text-center text-muted-foreground text-sm">
          No resources available
        </div>
      </WidgetCard>
    )
  }

  return (
    <WidgetCard title="Resource Centre" icon={FolderOpen} action={{ label: "Browse All", href: "/resources" }}>
      <div className="space-y-3">
        {resources.map((resource) => (
          <Link
            key={resource.id}
            href="/resources"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm text-foreground truncate">{resource.title}</h4>
                {isNew(resource.created_at) && (
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{resource.description}</p>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="text-xs">
                  {resource.file_type}
                </Badge>
                <span className="text-xs text-muted-foreground">{resource.download_count || 0} downloads</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => handleDownload(resource, e)}>
              <Download className="w-4 h-4" />
            </Button>
          </Link>
        ))}
      </div>
    </WidgetCard>
  )
}
