"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"
import { PromptForm } from "./prompt-form"
import { initialMessages, Message } from "@/lib/chat-data"
import { Separator } from "@/components/ui/separator"

export function ChatPanel() {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const scrollViewportRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const scrollViewport = scrollViewportRef.current
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex h-screen flex-col">
      <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="space-y-8">
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                <ChatMessage message={message} />
                {index < messages.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </ScrollArea>
      <div className="flex justify-center border-t bg-background p-4">
        <PromptForm />
      </div>
    </div>
  )
}