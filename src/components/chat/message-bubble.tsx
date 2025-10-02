"use client"

import { cn } from "@/lib/utils"
import { Message } from "@/lib/mock-data"

interface MessageBubbleProps {
  message: Message
  currentUserId: string
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isOwnMessage = message.senderId === currentUserId

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-xs rounded-lg p-3 md:max-w-md",
          isOwnMessage
            ? "bg-primary text-primary-foreground"
            : "bg-background"
        )}
      >
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  )
}