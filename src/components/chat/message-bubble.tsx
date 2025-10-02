import { cn } from "@/lib/utils";
import { Message, currentUser, users } from "@/data/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isCurrentUser = message.senderId === currentUser.id;
  const sender = users.find(user => user.id === message.senderId);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <div className={cn("flex items-start gap-3", isCurrentUser && "justify-end")}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{sender ? getInitials(sender.name) : 'U'}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "rounded-lg p-3 max-w-xs lg:max-w-md",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <p className="text-xs text-right mt-1 opacity-70">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{sender ? getInitials(sender.name) : 'U'}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}