"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Sparkles } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your TradePod AI Assistant. I can help you with business insights, member support, and more. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "This is a placeholder response. The AI assistant functionality will be implemented soon.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 800)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">AI Assistant</h1>
        </div>
        <p className="text-muted-foreground">Get instant help and insights powered by AI</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-muted-foreground rounded-bl-none"
                }`}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
