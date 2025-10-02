"use client";

import * as React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ChatList } from "./chat-list";
import { ChatWindow } from "./chat-window";
import { useIsMobile } from "@/hooks/use-mobile";
import { chats, Chat } from "@/data/mock-data";

export function ChatLayout() {
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        {!selectedChat ? (
          <ChatList chats={chats} onSelectChat={setSelectedChat} />
        ) : (
          <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />
        )}
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
        <ChatList chats={chats} onSelectChat={setSelectedChat} selectedChatId={selectedChat?.id} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        {selectedChat ? (
          <ChatWindow chat={selectedChat} />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}