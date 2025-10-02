import { MessageBubble } from "./message-bubble";
import { Message } from "@/data/mock-data";

interface MessageListProps {
  messages: Message[];
  onRetry: (message: Message) => void;
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onRetry={onRetry} />
      ))}
    </div>
  );
}