"use client"

import { useState, useEffect } from "react"
import { Gift, Clock, Star, Loader2 } from "lucide-react"
import { WidgetCard } from "@/components/dashboard/widget-card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Perk {
  id: string
  title: string
  description: string
  partner_name: string
  category: string
  discount_value: string
  valid_until: string | null
  is_featured: boolean
}

export function PerksWidget() {
  const [perks, setPerks] = useState<Perk[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadPerks() {
      try {
        const { data, error } = await supabase
          .from("perks")
          .select("*")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(3)
        
        if (error) throw error
        setPerks(data || [])
      } catch (error) {
        console.error("Error loading perks:", error)
      } finally {
        setLoading(false)
      }
    }
    loadPerks()
  }, [])

  if (loading) {
    return (
      <WidgetCard title="Partner Perks & Deals" icon={Gift} action={{ label: "Browse All", href: "/perks" }}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </WidgetCard>
    )
  }

  if (perks.length === 0) {
    return (
      <WidgetCard title="Partner Perks & Deals" icon={Gift} action={{ label: "Browse All", href: "/perks" }}>
        <div className="py-8 text-center text-muted-foreground text-sm">
          No perks available at this time
        </div>
      </WidgetCard>
    )
  }

  return (
    <WidgetCard title="Partner Perks & Deals" icon={Gift} action={{ label: "Browse All", href: "/perks" }}>
      <div className="space-y-3">
        {perks.map((perk) => (
          <Link
            key={perk.id}
            href="/perks"
            className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors block"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{perk.partner_name}</span>
                  {perk.is_featured && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                </div>
                <h4 className="font-medium text-sm text-foreground mt-0.5">{perk.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{perk.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {perk.valid_until ? `Ends ${new Date(perk.valid_until).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : "Ongoing"}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {perk.category}
                  </Badge>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </WidgetCard>
  )
}
