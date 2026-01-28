"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, MoreHorizontal, Mail, UserX, Edit, Eye, Filter, Loader2, Copy, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/auth"

interface MembersPageClientProps {
  initialMembers: UserProfile[]
}

export function MembersPageClient({ initialMembers }: MembersPageClientProps) {
  const router = useRouter()
  const [members, setMembers] = useState<UserProfile[]>(initialMembers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createdUser, setCreatedUser] = useState<{ email: string; tempPassword: string } | null>(null)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [newMember, setNewMember] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    role: "member" as "admin" | "member" | "partner",
    hasVirtualMail: true,
    hasLeadsAccess: true,
    hasDirectoryListing: true,
    tempPassword: "",
  })
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; member: UserProfile | null }>({
    open: false,
    member: null,
  })
  const [newPassword, setNewPassword] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && member.is_active) ||
      (statusFilter === "inactive" && !member.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleAddMember = async () => {
    setIsCreating(true)
    setCreateError(null)

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create member")
      }

      setCreatedUser({
        email: data.user.email,
        tempPassword: data.user.tempPassword,
      })

      // Refresh the members list
      router.refresh()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyPassword = () => {
    if (createdUser) {
      navigator.clipboard.writeText(createdUser.tempPassword)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  const handleCloseDialog = () => {
    setAddDialogOpen(false)
    setCreatedUser(null)
    setCreateError(null)
    setCopiedPassword(false)
    setNewMember({
      fullName: "",
      email: "",
      phone: "",
      companyName: "",
      role: "member",
      hasVirtualMail: true,
      hasLeadsAccess: true,
      hasDirectoryListing: true,
      tempPassword: "",
    })
  }

  const handleResetPassword = async () => {
    if (!resetPasswordDialog.member || !newPassword) return
    
    setIsResetting(true)
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: resetPasswordDialog.member.id,
          newPassword: newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      setResetSuccess(true)
      // Update the member in the list to show pending setup status
      setMembers(members.map((m) => 
        m.id === resetPasswordDialog.member?.id 
          ? { ...m, must_change_password: true } 
          : m
      ))
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsResetting(false)
    }
  }

  const handleCloseResetDialog = () => {
    setResetPasswordDialog({ open: false, member: null })
    setNewPassword("")
    setResetSuccess(false)
    setCreateError(null)
  }

  const handleToggleStatus = async (memberId: string, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("profiles").update({ is_active: !currentStatus }).eq("id", memberId)

    if (!error) {
      setMembers(members.map((m) => (m.id === memberId ? { ...m, is_active: !currentStatus } : m)))
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Admin</Badge>
      case "member":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Member</Badge>
      case "partner":
        return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Partner</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean, mustChangePassword: boolean) => {
    if (!isActive) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-600">
          Inactive
        </Badge>
      )
    }
    if (mustChangePassword) {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          Pending Setup
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-green-600 border-green-600">
        Active
      </Badge>
    )
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="p-4 md:p-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{members.length}</p>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{members.filter((m) => m.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{members.filter((m) => m.role === "member").length}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{members.filter((m) => m.role === "partner").length}</p>
            <p className="text-xs text-muted-foreground">Partners</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-base">All Members</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  {createdUser ? (
                    <>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Member Created Successfully
                        </DialogTitle>
                        <DialogDescription>
                          Share these login credentials with the new member. They will be required to change their
                          password on first login.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Alert>
                          <AlertDescription>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">{createdUser.email}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Temporary Password</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                    {createdUser.tempPassword}
                                  </code>
                                  <Button size="sm" variant="outline" onClick={handleCopyPassword}>
                                    {copiedPassword ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                        <p className="text-sm text-muted-foreground">
                          Make sure to copy and securely share these credentials with the member. The temporary password
                          will not be shown again.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCloseDialog}>Done</Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <>
                      <DialogHeader>
                        <DialogTitle>Add New Member</DialogTitle>
                        <DialogDescription>
                          Create a new member account. A temporary password will be generated for them to use on first
                          login.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {createError && (
                          <Alert variant="destructive">
                            <AlertDescription>{createError}</AlertDescription>
                          </Alert>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                              id="fullName"
                              placeholder="e.g. John Smith"
                              value={newMember.fullName}
                              onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                              id="companyName"
                              placeholder="e.g. Smith Plumbing Ltd"
                              value={newMember.companyName}
                              onChange={(e) => setNewMember({ ...newMember, companyName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@example.co.uk"
                              value={newMember.email}
                              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              placeholder="07700 900000"
                              value={newMember.phone}
                              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tempPassword">Temporary Password *</Label>
                          <Input
                            id="tempPassword"
                            type="text"
                            placeholder="Enter a temporary password"
                            value={newMember.tempPassword}
                            onChange={(e) => setNewMember({ ...newMember, tempPassword: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">
                            This password will be used for the member's first login. They will be prompted to change it.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role *</Label>
                          <Select
                            value={newMember.role}
                            onValueChange={(value: "admin" | "member" | "partner") =>
                              setNewMember({ ...newMember, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin - Full access to all features and admin panel</SelectItem>
                              <SelectItem value="member">Member - Standard member access</SelectItem>
                              <SelectItem value="partner">Partner - Limited access (Profile, Perks, Events only)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="border-t border-border pt-4">
                          <Label className="text-sm font-medium">Feature Access</Label>
                          <p className="text-xs text-muted-foreground mb-3">
                            Configure which features this member can access
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Virtual Mail</p>
                                <p className="text-xs text-muted-foreground">Receive and manage business mail</p>
                              </div>
                              <Switch
                                checked={newMember.hasVirtualMail}
                                onCheckedChange={(checked) => setNewMember({ ...newMember, hasVirtualMail: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Leads Pipeline</p>
                                <p className="text-xs text-muted-foreground">Access to lead referrals</p>
                              </div>
                              <Switch
                                checked={newMember.hasLeadsAccess}
                                onCheckedChange={(checked) => setNewMember({ ...newMember, hasLeadsAccess: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Directory Listing</p>
                                <p className="text-xs text-muted-foreground">Public profile in trades directory</p>
                              </div>
                              <Switch
                                checked={newMember.hasDirectoryListing}
                                onCheckedChange={(checked) =>
                                  setNewMember({ ...newMember, hasDirectoryListing: checked })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog} className="bg-transparent">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddMember}
                          disabled={!newMember.fullName || !newMember.email || !newMember.companyName || isCreating}
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Create Member
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.full_name || "No name"}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{member.company_name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {member.has_virtual_mail && (
                        <Badge variant="secondary" className="text-[10px]">
                          Mail
                        </Badge>
                      )}
                      {member.has_leads_access && (
                        <Badge variant="secondary" className="text-[10px]">
                          Leads
                        </Badge>
                      )}
                      {member.has_directory_listing && (
                        <Badge variant="secondary" className="text-[10px]">
                          Directory
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(member.is_active, member.must_change_password)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {formatDate(member.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setResetPasswordDialog({ open: true, member })}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(member.id, member.is_active)}
                          className={member.is_active ? "text-red-600" : "text-green-600"}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          {member.is_active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog.open} onOpenChange={(open) => !open && handleCloseResetDialog()}>
        <DialogContent className="sm:max-w-md">
          {resetSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Password Reset Successfully
                </DialogTitle>
                <DialogDescription>
                  The password has been reset for {resetPasswordDialog.member?.full_name}. They will be required to change it on their next login.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={handleCloseResetDialog}>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Set a new temporary password for {resetPasswordDialog.member?.full_name}. They will be prompted to create their own password on next login.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {createError && (
                  <Alert variant="destructive">
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Temporary Password</Label>
                  <Input
                    id="newPassword"
                    type="text"
                    placeholder="Enter a temporary password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This password will be single-use. The member will be required to change it on login.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseResetDialog}>
                  Cancel
                </Button>
                <Button onClick={handleResetPassword} disabled={isResetting || !newPassword}>
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
