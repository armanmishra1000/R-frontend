import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";

interface MessageComposerProps {
  onSendMessage: (content: string, tempId: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export function MessageComposer({ onSendMessage, onTyping }: MessageComposerProps) {
  const [message, setMessage] = React.useState("");
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        onTyping(false); // Ensure typing state is reset
        typingTimeoutRef.current = null;
      }
    };
  }, [onTyping]);

  const handleSend = () => {
    if (message.trim()) {
      const tempId = `temp-${Date.now()}`;
      onSendMessage(message.trim(), tempId);
      setMessage("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        onTyping(false);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      onTyping(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
      typingTimeoutRef.current = null;
    }, 1300);
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
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <Button size="icon" onClick={handleSend} aria-label="Send message">
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}