"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const STORAGE_KEY = "multi-agent-chat-history";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: () => {
      console.log("[Client] Stream finished");
      scrollToBottom();
    },
    onError: (error) => {
      console.error("[Client] Chat error:", error);
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  // Restore messages from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsedMessages = JSON.parse(saved);
          console.log("[Client] Restored", parsedMessages.length, "messages from localStorage");
          setMessages(parsedMessages);
        } catch (error) {
          console.error("[Client] Failed to parse saved messages:", error);
          localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
        }
      }
    }
    setIsMessagesLoaded(true);
  }, [setMessages]);

  // Clear chat handler
  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    console.log("[Client] Chat cleared");
  };

  // Log status changes
  useEffect(() => {
    console.log("[Client] Status changed:", status);
  }, [status]);

  // Log messages changes
  useEffect(() => {
    console.log("[Client] Messages updated:", messages.length, messages);
  }, [messages]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.error("[Client] Error state:", error);
    }
  }, [error]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Persist messages to localStorage whenever they change (improved)
  useEffect(() => {
    if (typeof window !== "undefined" && isMessagesLoaded) {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        console.log("[Client] Saved", messages.length, "messages to localStorage");
      } else {
        localStorage.removeItem(STORAGE_KEY);
        console.log("[Client] Removed empty chat from localStorage");
      }
    }
  }, [messages, isMessagesLoaded]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main className="mx-auto flex h-screen max-w-4xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Multi-Agent Browser Automation</h1>
          <p className="text-sm text-muted-foreground">
            Powered by Gemini 2.0 Flash
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Agent is thinking…
            </span>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={messages.length === 0}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Chat
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all messages in this conversation.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearChat}>
                  Clear Chat
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <ScrollArea className="flex-1 rounded-md border">
        <div className="flex flex-col gap-4 p-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center py-12 text-center">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Welcome to the Multi-Agent Chat</h2>
                <p className="text-sm text-muted-foreground">
                  Ask the agent to research, analyze, or automate browser tasks
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => {
            const textContent = message.parts
              .filter((part) => part.type === "text")
              .map((part) => ("text" in part ? part.text : ""))
              .join("");

            return (
              <article
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[80%] rounded-lg bg-primary px-4 py-3 text-primary-foreground"
                    : "mr-auto max-w-[80%] rounded-lg border bg-muted px-4 py-3"
                }
              >
                <div className="mb-1 text-xs font-semibold opacity-70">
                  {message.role === "user" ? "You" : "Agent"}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {textContent}
                </p>
              </article>
            );
          })}

          {isLoading && (
            <div className="mr-auto max-w-[80%] space-y-2 rounded-lg border bg-muted px-4 py-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">
                <strong>Error:</strong> {error.message}
              </p>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer">Details</summary>
                <pre className="mt-2 overflow-auto">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || isLoading) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="flex flex-col gap-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!input.trim() || isLoading) return;
              sendMessage({ text: input });
              setInput("");
            }
          }}
          placeholder="Ask the agent to research the WordPress subreddit, analyze trends, or automate tasks…"
          rows={3}
          className="resize-none"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? "Sending…" : "Send"}
          </Button>
        </div>
      </form>
    </main>
  );
}
