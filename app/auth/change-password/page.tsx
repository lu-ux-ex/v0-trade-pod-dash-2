"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Update profile to mark password as changed
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ must_change_password: false })
          .eq("id", user.id)

        if (profileError) throw profileError
      }

      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/472180372-1544693072889416-7341356055758265641-n.jpg"
              alt="TradePod Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Set Your Password</CardTitle>
              <CardDescription>Please create a new password for your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Set Password & Continue"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
