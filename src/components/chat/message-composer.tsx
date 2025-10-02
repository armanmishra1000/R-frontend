"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send } from "lucide-react"

export function MessageComposer() {
  return (
    <div className="border-t bg-background p-4">
      <form className="flex items-start gap-2">
        <Button variant="ghost" size="icon" type="button" className="shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Textarea
          placeholder="Type a message..."
          className="min-h-0 resize-none"
          rows={1}
        />
        <Button size="icon" type="submit" className="shrink-0">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}