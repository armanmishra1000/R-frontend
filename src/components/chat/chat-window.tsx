import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";
import { Chat, User, currentUser } from "@/data/mock-data";

interface ChatWindowProps {
  chat: Chat;
  onBack?: () => void;
}

export function ChatWindow({ chat, onBack }: ChatWindowProps) {
  const getChatName = (chat: Chat, currentUser: User) => {
    if (chat.type === 'group') {
      return chat.name || chat.participants.map(p => p.name).join(', ');
    }
    const otherUser = chat.participants.find(p => p.id !== currentUser.id);
    return otherUser?.name || 'Unknown User';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  const chatName = getChatName(chat, currentUser);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 border-b p-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getInitials(chatName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{chatName}</p>
          <p className="text-sm text-muted-foreground">Online</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={chat.messages} />
      </div>
      <div className="border-t p-4">
        <MessageComposer />
      </div>
    </div>
  );
}