"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Copy, Check, Search } from "lucide-react"

export default function SetupContent() {
  const [email, setEmail] = useState("la@tradepod.uk")
  const [fullName, setFullName] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    credentials?: { email: string; temporaryPassword: string; loginUrl: string }
    error?: string
    note?: string
    message?: string
  } | null>(null)
  const [checkResult, setCheckResult] = useState<{
    authUserExists?: boolean
    authUser?: { id: string; email: string; confirmed: boolean; createdAt: string } | null
    profileExists?: boolean
    profile?: Record<string, unknown> | null
    error?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setCheckResult(null)

    try {
      const response = await fetch("/api/setup/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, secretKey }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Failed to create admin user. Check your network connection." })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckUser = async () => {
    if (!secretKey) {
      setCheckResult({ error: "Please enter the secret key first" })
      return
    }
    setChecking(true)
    setCheckResult(null)

    try {
      const response = await fetch("/api/setup/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, secretKey }),
      })

      const data = await response.json()
      setCheckResult(data)
    } catch (error) {
      setCheckResult({ error: "Failed to check user" })
    } finally {
      setChecking(false)
    }
  }

  const copyCredentials = () => {
    if (result?.credentials) {
      navigator.clipboard.writeText(
        `Email: ${result.credentials.email}\nTemporary Password: ${result.credentials.temporaryPassword}\nLogin URL: ${window.location.origin}${result.credentials.loginUrl}`,
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">TradePod Admin Setup</CardTitle>
          <CardDescription>Create your initial admin account. This page should only be used once.</CardDescription>
        </CardHeader>
        <CardContent>
          {result?.success ? (
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">{result.message}</AlertDescription>
              </Alert>

              {result.note && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.note}</AlertDescription>
                </Alert>
              )}

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <p className="font-mono font-medium">{result.credentials?.email}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Temporary Password:</span>
                  <p className="font-mono font-medium">{result.credentials?.temporaryPassword}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Login URL:</span>
                  <p className="font-mono font-medium text-primary">
                    {typeof window !== "undefined" ? window.location.origin : ""}
                    {result.credentials?.loginUrl}
                  </p>
                </div>
              </div>

              <Button onClick={copyCredentials} variant="outline" className="w-full bg-transparent">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" /> Copy Credentials
                  </>
                )}
              </Button>

              <Button asChild className="w-full">
                <a href="/auth/login">Go to Login</a>
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Important: After logging in, please delete the /app/setup folder and /app/api/setup folder for security.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {result?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}

              {checkResult && (
                <Alert className={checkResult.error ? "border-destructive" : "border-blue-500"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>User Check Result</AlertTitle>
                  <AlertDescription className="text-xs mt-2">
                    {checkResult.error ? (
                      <span className="text-destructive">{checkResult.error}</span>
                    ) : (
                      <div className="space-y-1">
                        <p>
                          Auth User Exists: <strong>{checkResult.authUserExists ? "Yes" : "No"}</strong>
                        </p>
                        {checkResult.authUser && (
                          <p>
                            Email Confirmed: <strong>{checkResult.authUser.confirmed ? "Yes" : "No"}</strong>
                          </p>
                        )}
                        <p>
                          Profile Exists: <strong>{checkResult.profileExists ? "Yes" : "No"}</strong>
                        </p>
                        {checkResult.profile && (
                          <p>
                            Role: <strong>{String(checkResult.profile.role)}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey">Setup Secret Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter the secret key"
                  required
                />
                <p className="text-xs text-muted-foreground">The secret key is: TRADEPOD_SETUP_2024</p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckUser}
                  disabled={checking}
                  className="flex-1 bg-transparent"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {checking ? "Checking..." : "Check User"}
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Creating..." : "Create Admin"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
