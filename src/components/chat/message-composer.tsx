import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";

export function MessageComposer() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon">
        <Paperclip className="h-5 w-5" />
      </Button>
      <Input placeholder="Type a message..." className="flex-1" />
      <Button size="icon">
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}