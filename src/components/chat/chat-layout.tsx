"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ChatList } from "./chat-list"
import { ChatWindow } from "./chat-window"
import { useIsMobile } from "@/hooks/use-mobile"
import { chats, Chat } from "@/lib/mock-data"

export function ChatLayout() {
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(chats[0])
  const isMobile = useIsMobile()

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chats.find(c => c.id === chatId) || null)
  }

  if (isMobile) {
    return (
      <div className="h-screen">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <ChatList chats={chats} onSelectChat={handleSelectChat} />
        )}
      </div>
    )
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
        <ChatList chats={chats} selectedChatId={selectedChat?.id} onSelectChat={handleSelectChat} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        {selectedChat ? (
          <ChatWindow chat={selectedChat} />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted/50">
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}