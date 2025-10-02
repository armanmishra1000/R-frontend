import { MessageBubble } from "./message-bubble";
import { Message } from "@/data/mock-data";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}