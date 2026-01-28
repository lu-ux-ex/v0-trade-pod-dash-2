"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, TrendingUp, Eye, MousePointer, Calendar, FileText, MessageSquare, Clock } from "lucide-react"

const metrics = {
  activeUsers: { value: 89, change: 12 },
  pageViews: { value: 2456, change: 8 },
  avgSessionTime: { value: "4m 32s", change: 5 },
  bounceRate: { value: "34%", change: -3 },
}

const widgetEngagement = [
  { name: "Dashboard", views: 1245, interactions: 567, avgTime: "2m 15s" },
  { name: "Leads", views: 892, interactions: 423, avgTime: "3m 45s" },
  { name: "Bookings", views: 756, interactions: 312, avgTime: "1m 52s" },
  { name: "Virtual Mail", views: 645, interactions: 234, avgTime: "1m 18s" },
  { name: "Community", views: 534, interactions: 189, avgTime: "4m 23s" },
  { name: "Events", views: 423, interactions: 156, avgTime: "2m 01s" },
  { name: "Resources", views: 389, interactions: 145, avgTime: "2m 34s" },
  { name: "Perks", views: 312, interactions: 98, avgTime: "1m 45s" },
]

const leadMetrics = {
  totalLeads: 156,
  conversionRate: "34%",
  avgResponseTime: "2.5 hrs",
  topCategories: [
    { name: "Kitchen Renovation", count: 34 },
    { name: "Bathroom Refit", count: 28 },
    { name: "Plumbing", count: 24 },
    { name: "Electrical", count: 18 },
  ],
}

const contentMetrics = {
  resourceDownloads: 892,
  dealClicks: 456,
  eventRSVPs: 123,
  messageboardPosts: 78,
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <Select defaultValue="30d">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Users className="w-5 h-5 text-blue-600" />
              <span className={`text-xs ${metrics.activeUsers.change > 0 ? "text-green-600" : "text-red-600"}`}>
                {metrics.activeUsers.change > 0 ? "+" : ""}
                {metrics.activeUsers.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{metrics.activeUsers.value}</p>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Eye className="w-5 h-5 text-purple-600" />
              <span className={`text-xs ${metrics.pageViews.change > 0 ? "text-green-600" : "text-red-600"}`}>
                +{metrics.pageViews.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{metrics.pageViews.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Page Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-xs text-green-600">+{metrics.avgSessionTime.change}%</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{metrics.avgSessionTime.value}</p>
            <p className="text-xs text-muted-foreground">Avg Session</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-xs text-green-600">{metrics.bounceRate.change}%</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{metrics.bounceRate.value}</p>
            <p className="text-xs text-muted-foreground">Bounce Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList>
          <TabsTrigger value="engagement">Widget Engagement</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* Widget Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Widget Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {widgetEngagement.map((widget, index) => (
                  <div key={widget.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}</span>
                      <div>
                        <p className="font-medium text-foreground">{widget.name}</p>
                        <p className="text-xs text-muted-foreground">Avg time: {widget.avgTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="font-medium text-foreground">{widget.views.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{widget.interactions.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">interactions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{leadMetrics.totalLeads}</p>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{leadMetrics.conversionRate}</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{leadMetrics.avgResponseTime}</p>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Lead Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leadMetrics.topCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(category.count / leadMetrics.topCategories[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-8">{category.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="w-6 h-6 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold text-foreground">{contentMetrics.resourceDownloads}</p>
                <p className="text-xs text-muted-foreground">Resource Downloads</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MousePointer className="w-6 h-6 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-foreground">{contentMetrics.dealClicks}</p>
                <p className="text-xs text-muted-foreground">Deal Clicks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-foreground">{contentMetrics.eventRSVPs}</p>
                <p className="text-xs text-muted-foreground">Event RSVPs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-foreground">{contentMetrics.messageboardPosts}</p>
                <p className="text-xs text-muted-foreground">Community Posts</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
