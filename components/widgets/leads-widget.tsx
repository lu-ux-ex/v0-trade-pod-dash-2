"use client"

import { Users, Phone, Clock, TrendingUp } from "lucide-react"
import { WidgetCard } from "@/components/dashboard/widget-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const leads = [
  {
    id: 1,
    title: "Kitchen Renovation",
    customer: "Sarah M.",
    location: "Bristol BS6",
    status: "new",
    received: "2 hours ago",
    budget: "£8,000 - £12,000",
  },
  {
    id: 2,
    title: "Bathroom Refit",
    customer: "James P.",
    location: "Bath BA1",
    status: "contacted",
    received: "Yesterday",
    budget: "£3,000 - £5,000",
  },
  {
    id: 3,
    title: "Extension Work",
    customer: "Mike T.",
    location: "Bristol BS7",
    status: "new",
    received: "3 hours ago",
    budget: "£25,000+",
  },
]

export function LeadsWidget() {
  return (
    <WidgetCard title="Leads & Quote Requests" icon={Users} action={{ label: "View Pipeline", href: "/leads" }}>
      <div className="space-y-4">
        {/* Response time indicator */}
        <Link
          href="/leads"
          className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-400">Avg. response: 2.5 hrs</span>
          </div>
          <TrendingUp className="w-4 h-4 text-green-600" />
        </Link>

        {/* Leads list */}
        <div className="space-y-3">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href="/leads"
              className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors block"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-foreground">{lead.title}</h4>
                    <Badge variant={lead.status === "new" ? "default" : "secondary"} className="text-xs">
                      {lead.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lead.customer} • {lead.location}
                  </p>
                  <p className="text-xs text-primary font-medium mt-1">{lead.budget}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 bg-transparent"
                  onClick={(e) => e.preventDefault()}
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Contact
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{lead.received}</p>
            </Link>
          ))}
        </div>
      </div>
    </WidgetCard>
  )
}
