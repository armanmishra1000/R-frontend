import { ArrowLeft, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";
import { TypingIndicator } from "./typing-indicator";
import { PresenceBadge } from "./presence-badge";
import { Chat, User, Message, currentUser } from "@/data/mock-data";

interface ChatWindowProps {
  chat: Chat;
  users: User[];
  typingStatus: { [userId: string]: boolean };
  onBack?: () => void;
  onSendMessage: (content: string, tempId: string) => void;
  onRetrySendMessage: (message: Message) => void;
  onTyping: (isTyping: boolean) => void;
}

export function ChatWindow({ chat, users, typingStatus, onBack, onSendMessage, onRetrySendMessage, onTyping }: ChatWindowProps) {
  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || chat.participants.map(p => p.name).join(', ');
    }
    const otherUser = chat.participants.find(p => p.id !== currentUser.id);
    return otherUser?.name || 'Unknown User';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  const getChatStatus = (chat: Chat): string => {
    if (chat.type === 'group') {
      const onlineCount = chat.participants.filter(p => p.presence === 'online').length;
      return `${chat.participants.length} participants, ${onlineCount} online`;
    }
    const otherUser = chat.participants.find(p => p.id !== currentUser.id);
    return otherUser?.presence === 'online' ? 'Online' : 'Offline';
  };

  const chatName = getChatName(chat);
  const otherParticipants = chat.participants.filter(p => p.id !== currentUser.id);
  const typingUsers = Object.entries(typingStatus)
    .filter(([userId, isTyping]) => isTyping && userId !== currentUser.id)
    .map(([userId]) => users.find(u => u.id === userId)?.name || 'Someone')
    .filter(Boolean);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 border-b p-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to chat list">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="relative">
          <Avatar className="h-10 w-10">
            {chat.type === 'group' ? (
              <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
            ) : (
              <AvatarFallback>{getInitials(chatName)}</AvatarFallback>
            )}
          </Avatar>
          {chat.type === 'direct' && otherParticipants[0] && (
            <PresenceBadge presence={otherParticipants[0].presence} />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{chatName}</p>
          <p className="text-sm text-muted-foreground">{getChatStatus(chat)}</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={chat.messages} onRetry={onRetrySendMessage} />
      </div>
      <div className="border-t p-4">
        <TypingIndicator typingUsers={typingUsers} />
        <MessageComposer onSendMessage={onSendMessage} onTyping={onTyping} />
      </div>
    </div>
  );
}