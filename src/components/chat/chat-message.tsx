"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"

export interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={cn(
        "flex items-start gap-4",
      )}
    >
      <Avatar className="h-8 w-8 shrink-0 border">
        <AvatarFallback className="bg-transparent">
          {isAssistant ? <Bot /> : <User />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2 overflow-hidden pt-1">
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}