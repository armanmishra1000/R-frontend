"use client"

import { MessageList } from "./message-list"
import { MessageComposer } from "./message-composer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, Video } from "lucide-react"
import { Chat, currentUser } from "@/lib/mock-data"

interface ChatWindowProps {
  chat: Chat
  onBack?: () => void
}

export function ChatWindow({ chat, onBack }: ChatWindowProps) {
  const chatPartner = chat.participants[0]

  return (
    <div className="flex h-full flex-col bg-muted/50">
      <header className="flex items-center justify-between border-b bg-background p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar>
            <AvatarImage src={chatPartner.avatar} alt={chatPartner.name} />
            <AvatarFallback>{chatPartner.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{chatPartner.name}</p>
            <p className="text-sm text-muted-foreground">{chatPartner.online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <MessageList messages={chat.messages} currentUserId={currentUser.id} />
      <MessageComposer />
    </div>
  )
}