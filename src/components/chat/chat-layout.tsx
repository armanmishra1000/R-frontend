"use client";

import * as React from "react";
import { produce } from "immer";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ChatList } from "./chat-list";
import { ChatWindow } from "./chat-window";
import { useIsMobile } from "@/hooks/use-mobile";
import { chats as initialChats, users as initialUsers, Chat, Message, User, currentUser } from "@/data/mock-data";
import { websocketService } from "@/lib/websocket-service";

type TypingStatus = { [chatId: string]: { [userId: string]: boolean } };

export function ChatLayout() {
  const [chats, setChats] = React.useState<Chat[]>(initialChats);
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null);
  const [typingStatus, setTypingStatus] = React.useState<TypingStatus>({});
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const handleNewMessage = ({ chatId, message }: { chatId: string; message: Message }) => {
      setChats(prev => produce(prev, draft => {
        const chat = draft.find(c => c.id === chatId);
        if (chat) chat.messages.push(message);
      }));
    };

    const handleReconciledMessage = ({ chatId, tempId, finalMessage }: { chatId: string; tempId: string; finalMessage: Message }) => {
      setChats(prev => produce(prev, draft => {
        const chat = draft.find(c => c.id === chatId);
        if (chat) {
          const msgIndex = chat.messages.findIndex(m => m.id === tempId);
          if (msgIndex !== -1) chat.messages[msgIndex] = finalMessage;
        }
      }));
    };

    const handleTypingUpdate = ({ chatId, userId, isTyping }: { chatId: string; userId: string; isTyping: boolean }) => {
      setTypingStatus(prev => produce(prev, draft => {
        if (!draft[chatId]) draft[chatId] = {};
        draft[chatId][userId] = isTyping;
      }));
    };

    const handlePresenceUpdate = ({ userId, presence }: { userId: string; presence: 'online' | 'offline' | 'idle' }) => {
      setUsers(prev => produce(prev, draft => {
        const user = draft.find(u => u.id === userId);
        if (user) user.presence = presence;
      }));
    };

    websocketService.on('message.created', handleNewMessage);
    websocketService.on('message.reconciled', handleReconciledMessage);
    websocketService.on('typing.update', handleTypingUpdate);
    websocketService.on('presence.update', handlePresenceUpdate);

    return () => {
      websocketService.off('message.created', handleNewMessage);
      websocketService.off('message.reconciled', handleReconciledMessage);
      websocketService.off('typing.update', handleTypingUpdate);
      websocketService.off('presence.update', handlePresenceUpdate);
    };
  }, []);

  React.useEffect(() => {
    if (selectedChatId) {
      websocketService.subscribe(`chat:${selectedChatId}`);
    }
    return () => {
      if (selectedChatId) {
        websocketService.unsubscribe(`chat:${selectedChatId}`);
      }
    };
  }, [selectedChatId]);

  const handleSendMessage = (content: string, chatId: string, tempId: string) => {
    const tempMessage: Message = {
      id: tempId,
      tempId,
      senderId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setChats(prev => produce(prev, draft => {
      const chat = draft.find(c => c.id === chatId);
      if (chat) chat.messages.push(tempMessage);
    }));

    const timeout = setTimeout(() => {
      setChats(prev => produce(prev, draft => {
        const chat = draft.find(c => c.id === chatId);
        const msg = chat?.messages.find(m => m.id === tempId);
        if (msg && msg.status === 'sending') msg.status = 'failed';
      }));
    }, 10000);

    websocketService.on('message.reconciled', function onReconcile({ tempId: reconciledId }) {
      if (reconciledId === tempId) {
        clearTimeout(timeout);
        websocketService.off('message.reconciled', onReconcile);
      }
    });

    websocketService.send('message.create', { chatId, tempId, content });
  };

  const handleRetrySendMessage = (message: Message) => {
    if (!selectedChatId) return;
    const newTempId = `temp-${Date.now()}`;
    
    setChats(prev => produce(prev, draft => {
      const chat = draft.find(c => c.id === selectedChatId);
      if (chat) {
        const msgIndex = chat.messages.findIndex(m => m.id === message.id);
        if (msgIndex !== -1) {
          chat.messages.splice(msgIndex, 1);
        }
      }
    }));

    handleSendMessage(message.content, selectedChatId, newTempId);
  };

  const handleTyping = (isTyping: boolean) => {
    if (!selectedChatId) return;
    websocketService.send(isTyping ? 'typing.start' : 'typing.stop', { chatId: selectedChatId });
  };

  const enrichedChats = chats.map(chat => ({
    ...chat,
    participants: chat.participants.map(p => users.find(u => u.id === p.id) || p),
  }));

  const selectedChat = enrichedChats.find(c => c.id === selectedChatId);

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        {!selectedChat ? (
          <ChatList chats={enrichedChats} onSelectChat={(chat) => setSelectedChatId(chat.id)} />
        ) : (
          <ChatWindow
            chat={selectedChat}
            onBack={() => setSelectedChatId(null)}
            onSendMessage={(content, tempId) => handleSendMessage(content, selectedChat.id, tempId)}
            onRetrySendMessage={handleRetrySendMessage}
            onTyping={handleTyping}
            typingStatus={typingStatus[selectedChat.id] || {}}
            users={users}
          />
        )}
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
        <ChatList chats={enrichedChats} onSelectChat={(chat) => setSelectedChatId(chat.id)} selectedChatId={selectedChatId} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            onSendMessage={(content, tempId) => handleSendMessage(content, selectedChat.id, tempId)}
            onRetrySendMessage={handleRetrySendMessage}
            onTyping={handleTyping}
            typingStatus={typingStatus[selectedChat.id] || {}}
            users={users}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}