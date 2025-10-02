import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";

export function MessageComposer() {
  const [message, setMessage] = React.useState("");

  const handleSend = () => {
    if (message.trim()) {
      // In a real app, you'd call a prop like onSend(message)
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" aria-label="Attach file">
        <Paperclip className="h-5 w-5" />
      </Button>
      <Input
        placeholder="Type a message..."
        className="flex-1"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button size="icon" onClick={handleSend} aria-label="Send message">
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}