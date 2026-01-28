"use client"

import { Mail, FileText } from "lucide-react"
import { WidgetCard } from "@/components/dashboard/widget-card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const mailItems = [
  {
    id: 1,
    sender: "HMRC",
    description: "Tax correspondence",
    status: "scanned",
    date: "Today",
    isNew: true,
  },
  {
    id: 2,
    sender: "Companies House",
    description: "Annual return confirmation",
    status: "scanned",
    date: "Yesterday",
    isNew: true,
  },
  {
    id: 3,
    sender: "Insurance Co.",
    description: "Policy renewal documents",
    status: "awaiting_scan",
    date: "2 days ago",
    isNew: false,
  },
]

export function VirtualMailWidget() {
  return (
    <WidgetCard title="Virtual Mail" icon={Mail} action={{ label: "View All", href: "/mail" }}>
      <div className="space-y-3">
        <Link
          href="/mail"
          className="flex items-center justify-between p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">New Mail Items</span>
          </div>
          <Badge className="bg-primary text-primary-foreground">3</Badge>
        </Link>

        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded-lg">
          <span className="font-medium">Your Business Address:</span>
          <p className="mt-1">
            Unit 5, TradePod Business Hub
            <br />
            Industrial Estate, Bristol BS1 4DJ
          </p>
        </div>

        <div className="space-y-2">
          {mailItems.map((item) => (
            <Link
              key={item.id}
              href="/mail"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors block"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{item.sender}</span>
                  {item.isNew && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
              <Badge variant={item.status === "scanned" ? "default" : "secondary"} className="text-xs shrink-0">
                {item.status === "scanned" ? "Ready" : "Pending"}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </WidgetCard>
  )
}
