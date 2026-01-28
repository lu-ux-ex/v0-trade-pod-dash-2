"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare, ThumbsUp, MessageCircle, Pin } from "lucide-react"
import { WidgetCard } from "@/components/dashboard/widget-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const initialPosts = [
  {
    id: 1,
    author: "Dave Wilson",
    avatar: "DW",
    content: "Anyone have recommendations for a good van insurance provider? Looking to switch.",
    time: "1 hour ago",
    likes: 8,
    replies: 12,
    isPinned: false,
    category: "General",
    liked: false,
  },
  {
    id: 2,
    author: "TradePod Admin",
    avatar: "TP",
    content: "Reminder: The workshop will be closed for maintenance on Saturday 18th. Plan your projects accordingly!",
    time: "3 hours ago",
    likes: 15,
    replies: 3,
    isPinned: true,
    category: "Announcement",
    liked: false,
  },
  {
    id: 3,
    author: "Lisa Chen",
    avatar: "LC",
    content: "Just finished a great networking session at Coffee Club. Thanks everyone who came!",
    time: "Yesterday",
    likes: 24,
    replies: 6,
    isPinned: false,
    category: "Networking",
    liked: false,
  },
]

export function CommunityWidget() {
  const [posts, setPosts] = useState(initialPosts)

  const handleLike = (postId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post,
      ),
    )
  }

  return (
    <WidgetCard title="Message Board" icon={MessageSquare} action={{ label: "View All", href: "/community" }}>
      <div className="space-y-3">
        <Button variant="outline" className="w-full bg-transparent" size="sm" asChild>
          <Link href="/community">
            <MessageSquare className="w-4 h-4 mr-2" />
            Start a Discussion
          </Link>
        </Button>

        <div className="space-y-3 pt-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href="/community"
              className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors block"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`/.jpg?height=32&width=32&query=${post.author} portrait`} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{post.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{post.author}</span>
                    {post.isPinned && <Pin className="w-3 h-3 text-primary" />}
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                    <button
                      onClick={(e) => handleLike(post.id, e)}
                      className={`text-xs flex items-center gap-1 transition-colors ${post.liked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${post.liked ? "fill-primary" : ""}`} />
                      {post.likes}
                    </button>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {post.replies}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </WidgetCard>
  )
}
