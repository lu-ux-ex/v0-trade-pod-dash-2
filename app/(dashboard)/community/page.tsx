"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Pin,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Flag,
  Share2,
  Bookmark,
  Send,
  Loader2,
  X,
  CheckCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

const categories = ["All", "General", "Advice", "Jobs", "Networking", "Announcements"]

interface Post {
  id: number
  author: string
  authorId: string
  avatar: string
  content: string
  time: string
  likes: number
  likedByUser: boolean
  replies: Comment[]
  isPinned: boolean
  category: string
  isAdmin: boolean
  status: "pending" | "approved" | "rejected"
}

interface Comment {
  id: number
  author: string
  authorId: string
  content: string
  time: string
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: "TradePod Admin",
    authorId: "admin-1",
    avatar: "TP",
    content:
      "Reminder: The workshop will be closed for maintenance on Saturday 18th January. Please plan your projects accordingly. The meeting rooms and hot desks will remain available as normal.",
    time: "3 hours ago",
    likes: 15,
    likedByUser: false,
    replies: [],
    isPinned: true,
    category: "Announcements",
    isAdmin: true,
    status: "approved",
  },
  {
    id: 2,
    author: "Dave Wilson",
    authorId: "user-1",
    avatar: "DW",
    content:
      "Anyone have recommendations for a good van insurance provider? Just got a new Transit and my current insurer's renewal quote is ridiculous. Looking for something competitive but reliable.",
    time: "1 hour ago",
    likes: 8,
    likedByUser: false,
    replies: [
      { id: 1, author: "Mike T", authorId: "user-2", content: "I use Simply Business, great rates!", time: "30 mins ago" },
    ],
    isPinned: false,
    category: "Advice",
    isAdmin: false,
    status: "approved",
  },
  {
    id: 3,
    author: "Lisa Chen",
    authorId: "user-2",
    avatar: "LC",
    content:
      "Just finished a great networking session at Coffee Club this morning. Thanks everyone who came! Really enjoyed the discussion about marketing for trade businesses. See you all next week!",
    time: "Yesterday",
    likes: 24,
    likedByUser: true,
    replies: [],
    isPinned: false,
    category: "Networking",
    isAdmin: false,
    status: "approved",
  },
  {
    id: 4,
    author: "Mike Thompson",
    authorId: "user-3",
    avatar: "MT",
    content:
      "Looking for a reliable electrician to partner with on a kitchen renovation project in BS7. Would need someone available in the next 2-3 weeks. Happy to discuss rates. DM me if interested.",
    time: "Yesterday",
    likes: 5,
    likedByUser: false,
    replies: [],
    isPinned: false,
    category: "Jobs",
    isAdmin: false,
    status: "approved",
  },
]

interface UserProfile {
  id: string
  role: "admin" | "member" | "partner"
  full_name: string
}

export default function CommunityPage() {
  const supabase = createClient()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [newPostOpen, setNewPostOpen] = useState(false)
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  
  // New post state
  const [newPostCategory, setNewPostCategory] = useState("General")
  const [newPostContent, setNewPostContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postSubmitted, setPostSubmitted] = useState(false)
  
  // Comment state
  const [commentingOnPost, setCommentingOnPost] = useState<number | null>(null)
  const [commentContent, setCommentContent] = useState("")
  const [myComments, setMyComments] = useState<{ postId: number; comments: Comment[] }[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from("profiles")
          .select("id, role, full_name")
          .eq("id", user.id)
          .single()

        if (data) {
          setProfile(data as UserProfile)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase())
    // Only show approved posts (or user's own pending posts)
    const isVisible = post.status === "approved" || post.authorId === profile?.id
    return matchesCategory && matchesSearch && isVisible
  })

  const pinnedPosts = filteredPosts.filter((p) => p.isPinned)
  const regularPosts = filteredPosts.filter((p) => !p.isPinned)

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
          likedByUser: !post.likedByUser,
        }
      }
      return post
    }))
  }

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !profile) return
    
    setIsSubmitting(true)
    try {
      // In production, save to database with status "pending"
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Add post locally with pending status
      const newPost: Post = {
        id: Date.now(),
        author: profile.full_name || "You",
        authorId: profile.id,
        avatar: (profile.full_name || "U").split(" ").map(n => n[0]).join("").toUpperCase(),
        content: newPostContent,
        time: "Just now",
        likes: 0,
        likedByUser: false,
        replies: [],
        isPinned: false,
        category: newPostCategory,
        isAdmin: profile.role === "admin",
        status: profile.role === "admin" ? "approved" : "pending",
      }
      
      setPosts([newPost, ...posts])
      setPostSubmitted(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseNewPost = () => {
    setNewPostOpen(false)
    setPostSubmitted(false)
    setNewPostContent("")
    setNewPostCategory("General")
  }

  const handleSubmitComment = (postId: number) => {
    if (!commentContent.trim() || !profile) return
    
    const newComment: Comment = {
      id: Date.now(),
      author: profile.full_name || "You",
      authorId: profile.id,
      content: commentContent,
      time: "Just now",
    }
    
    // Store comment locally - only visible to the post author
    setMyComments(prev => {
      const existing = prev.find(c => c.postId === postId)
      if (existing) {
        return prev.map(c => c.postId === postId ? { ...c, comments: [...c.comments, newComment] } : c)
      }
      return [...prev, { postId, comments: [newComment] }]
    })
    
    toast({
      title: "Comment Sent",
      description: "Your comment has been sent to the post author.",
    })
    
    setCommentContent("")
    setCommentingOnPost(null)
  }

  // Get comments for a post that were sent by current user to that post author
  const getCommentsForPost = (postId: number) => {
    return myComments.find(c => c.postId === postId)?.comments || []
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="community-search"
            name="community-search"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={newPostOpen} onOpenChange={handleCloseNewPost}>
            <DialogTrigger asChild>
              <Button type="button">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              {postSubmitted ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Post Submitted
                    </DialogTitle>
                    <DialogDescription>
                      {profile?.role === "admin" 
                        ? "Your post has been published." 
                        : "Your post has been submitted for review. An admin will approve it shortly before it appears in the community."}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button type="button" onClick={handleCloseNewPost}>Done</Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Create a Post</DialogTitle>
                    <DialogDescription>
                      Share something with the TradePod community.
                      {profile?.role !== "admin" && " Posts require admin approval before being published."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="post-category">Category</Label>
                      <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                        <SelectTrigger id="post-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((c) => c !== "All" && c !== "Announcements")
                            .map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="post-content">Your Message</Label>
                      <Textarea
                        id="post-content"
                        name="post-content"
                        placeholder="What's on your mind?"
                        className="min-h-32 resize-none"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseNewPost} className="bg-transparent">
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmitPost} disabled={isSubmitting || !newPostContent.trim()}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit for Review"
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Pin className="w-4 h-4" />
            Pinned
          </h2>
          {pinnedPosts.map((post) => (
            <Card key={post.id} className="bg-primary/5 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{post.author}</span>
                      {post.isAdmin && (
                        <Badge className="text-xs bg-primary/20 text-primary hover:bg-primary/30">Admin</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <Pin className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-sm text-foreground mt-2">{post.content}</p>
                    <div className="flex items-center gap-6 mt-4">
                      <span className="text-xs text-muted-foreground">{post.time}</span>
                      <button
                        type="button"
                        onClick={() => handleLike(post.id)}
                        className={`text-xs flex items-center gap-1 transition-colors ${
                          post.likedByUser ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ThumbsUp className={`w-3 h-3 ${post.likedByUser ? "fill-current" : ""}`} />
                        {post.likes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommentingOnPost(commentingOnPost === post.id ? null : post.id)}
                        className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Reply
                      </button>
                    </div>
                    
                    {/* Comment input */}
                    {commentingOnPost === post.id && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex gap-2">
                          <Textarea
                            id={`comment-${post.id}`}
                            name={`comment-${post.id}`}
                            placeholder="Write a reply... (only visible to the post author)"
                            className="min-h-16 resize-none text-sm"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCommentingOnPost(null)
                              setCommentContent("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSubmitComment(post.id)}
                            disabled={!commentContent.trim()}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Send
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Show user's own comments */}
                    {getCommentsForPost(post.id).length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground">Your comments (only visible to post author):</p>
                        {getCommentsForPost(post.id).map(comment => (
                          <div key={comment.id} className="p-2 bg-muted/50 rounded text-sm">
                            {comment.content}
                            <span className="text-xs text-muted-foreground ml-2">{comment.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Regular Posts */}
      <div className="space-y-4">
        {regularPosts.map((post) => (
          <Card key={post.id} className={`hover:border-primary/30 transition-colors ${post.status === "pending" ? "border-yellow-500/50" : ""}`}>
            <CardContent className="p-5">
              {post.status === "pending" && (
                <Alert className="mb-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
                    This post is awaiting admin approval and is only visible to you.
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">{post.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{post.author}</span>
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Bookmark className="w-4 h-4 mr-2" />
                          Save Post
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Flag className="w-4 h-4 mr-2" />
                          Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-foreground mt-2">{post.content}</p>
                  <div className="flex items-center gap-6 mt-4">
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className={`text-xs flex items-center gap-1 transition-colors ${
                        post.likedByUser ? "text-primary" : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${post.likedByUser ? "fill-current" : ""}`} />
                      {post.likes}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentingOnPost(commentingOnPost === post.id ? null : post.id)}
                      className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Reply
                    </button>
                  </div>
                  
                  {/* Comment input */}
                  {commentingOnPost === post.id && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex gap-2">
                        <Textarea
                          id={`comment-input-${post.id}`}
                          name={`comment-input-${post.id}`}
                          placeholder="Write a reply... (only visible to the post author)"
                          className="min-h-16 resize-none text-sm"
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCommentingOnPost(null)
                            setCommentContent("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={!commentContent.trim()}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Show user's own comments */}
                  {getCommentsForPost(post.id).length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">Your comments (only visible to post author):</p>
                      {getCommentsForPost(post.id).map(comment => (
                        <div key={comment.id} className="p-2 bg-muted/50 rounded text-sm">
                          {comment.content}
                          <span className="text-xs text-muted-foreground ml-2">{comment.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground">No posts found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
