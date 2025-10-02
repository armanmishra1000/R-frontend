import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Chat, User, currentUser } from "@/data/mock-data";

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
  selectedChatId?: string;
}

export function ChatList({ chats, onSelectChat, selectedChatId }: ChatListProps) {
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search chats..." className="pl-8" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              "flex items-center gap-3 p-3 cursor-pointer hover:bg-accent",
              selectedChatId === chat.id && "bg-accent"
            )}
            onClick={() => onSelectChat(chat)}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(getChatName(chat))}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold truncate">{getChatName(chat)}</p>
              <p className="text-sm text-muted-foreground truncate">
                {chat.messages[chat.messages.length - 1].content}
              </p>
            </div>
            {chat.unreadCount > 0 && (
              <Badge className="h-6 w-6 shrink-0 items-center justify-center rounded-full">
                {chat.unreadCount}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}