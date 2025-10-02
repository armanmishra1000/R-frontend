"use client"

import * as React from "react"
import { MessageBubble } from "./message-bubble"
import { Message } from "@/lib/mock-data"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} currentUserId={currentUserId} />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}