import * as React from "react";
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
  const [searchQuery, setSearchQuery] = React.useState("");

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || chat.participants.map(p => p.name).join(', ');
    }
    const otherUser = chat.participants.find(p => p.id !== currentUser.id);
    return otherUser?.name || 'Unknown User';
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  const filteredChats = React.useMemo(() => {
    if (!searchQuery) {
      return chats;
    }
    return chats.filter((chat) =>
      getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
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
                {chat.messages && chat.messages.length > 0
                  ? chat.messages[chat.messages.length - 1].content
                  : "No messages yet"}
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