import { cn } from "@/lib/utils";
import { Message, currentUser, users } from "@/data/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, RefreshCw } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  onRetry: (message: Message) => void;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isCurrentUser = message.senderId === currentUser.id;
  const sender = users.find(user => user.id === message.senderId);

  const senderName = sender?.name ?? "Unknown User";

  const getInitials = (name: string) => {
    if (!name) return 'UU';
    return name.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).join('').toUpperCase();
  }

  const avatarFallback = getInitials(senderName);

  const renderStatus = () => {
    if (message.status === 'sending') {
      return <Clock className="h-3 w-3 opacity-70" />;
    }
    if (message.status === 'failed') {
      return <AlertCircle className="h-3 w-3 text-destructive" />;
    }
    // Add other statuses like 'sent', 'delivered', 'read' here
    return null;
  };

  return (
    <div className={cn("flex items-start gap-3", isCurrentUser && "justify-end")}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col items-end gap-1">
        <div
          className={cn(
            "rounded-lg p-3 max-w-xs lg:max-w-md",
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          <p className="text-sm">{message.content}</p>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            {isCurrentUser && renderStatus()}
            <p className="text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        {message.status === 'failed' && isCurrentUser && (
          <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-destructive" onClick={() => onRetry(message)}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}