import type React from "react"
import { type LucideIcon, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface WidgetCardProps {
  title: string
  icon?: LucideIcon
  action?: {
    label: string
    href: string
  }
  children: React.ReactNode
  className?: string
}

export function WidgetCard({ title, icon: Icon, action, children, className }: WidgetCardProps) {
  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        {action && (
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" asChild>
            <Link href={action.href}>
              {action.label}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
