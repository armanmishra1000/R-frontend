"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

export function PromptForm() {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Form submission logic will be added later
    }
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="relative flex w-full max-w-2xl items-start"
    >
      <Textarea
        ref={inputRef}
        rows={1}
        placeholder="Ask me anything..."
        className="min-h-0 resize-none pr-12"
        onKeyDown={handleKeyDown}
      />
      <Button
        type="submit"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </form>
  )
}