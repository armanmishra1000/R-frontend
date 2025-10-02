"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Chat } from "@/lib/mock-data"

interface ChatListProps {
  chats: Chat[]
  selectedChatId?: string | null
  onSelectChat: (id: string) => void
}

export function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  return (
    <div className="flex h-full flex-col border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => {
          const partner = chat.participants[0]
          const lastMessage = chat.messages[chat.messages.length - 1]
          return (
            <button
              key={chat.id}
              className={cn(
                "flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent",
                selectedChatId === chat.id && "bg-accent"
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <Avatar>
                <AvatarImage src={partner.avatar} alt={partner.name} />
                <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{partner.name}</p>
                <p className="text-sm text-muted-foreground truncate">{lastMessage.content}</p>
              </div>
              {chat.unreadCount > 0 && (
                <Badge className="h-6 w-6 shrink-0 justify-center rounded-full p-0">
                  {chat.unreadCount}
                </Badge>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}