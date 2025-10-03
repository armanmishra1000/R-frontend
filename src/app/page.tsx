"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/lib/api";
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

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [input, setInput] = useState("");
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <main className="mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to access the chat.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push("/login")}>Sign in</Button>
          <Button variant="outline" onClick={() => router.push("/register")}>
            Sign up
          </Button>
        </div>
      </main>
    );
  }

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("[CLIENT] Logout API failed:", error);
    } finally {
      await refresh();
      router.push("/login");
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Send message function with SSE streaming
  const sendMessage = async (userMessage: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
    };

    console.log("[FRONTEND] → Sending message:", userMessage);

    // Add user message to state
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";
      const outbound = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      console.log("[FRONTEND] → Fetching from:", endpoint);
      const response = await fetch(`${endpoint}/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: outbound }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("[FRONTEND] → Stream complete");
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          if (!chunk.startsWith("data:")) continue;

          const payload = JSON.parse(chunk.slice(5).trim());
          console.log("[FRONTEND] → SSE event:", payload.type, payload);

          // Handle different event types - create separate messages for each
          if (payload.type === "reply") {
            // Main agent reply - create new message
            console.log("[FRONTEND] → Adding main agent reply");
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: payload.text
              }
            ]);
          } else if (payload.type === "subagent:start") {
            // Sub-agent started - create status message
            console.log("[FRONTEND] → Sub-agent started");
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `🔍 Starting sub-agent for: ${payload.payload.subreddit}...`
              }
            ]);
          } else if (payload.type === "subagent:unavailable") {
            // Sub-agent unavailable - show warning
            console.log("[FRONTEND] → Sub-agent unavailable");
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `⚠️ ${payload.payload.message}`
              }
            ]);
          } else if (payload.type === "subagent:result") {
            // Sub-agent completed - show results
            console.log("[FRONTEND] → Sub-agent result received");
            const result = payload.payload.result;
            const summary = `✅ **Plan generated:**\n${result.summary}\n\n**Steps:**\n${result.extractionPlan.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: summary
              }
            ]);
          } else if (payload.type === "subagent:error") {
            // Sub-agent error
            console.error("[FRONTEND] → Sub-agent error:", payload.payload.error);
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `❌ Error: ${payload.payload.error}`
              }
            ]);
          } else if (payload.type === "complete") {
            // Stream complete
            console.log("[FRONTEND] → Received complete event");
            continue;
          } else if (payload.type === "error") {
            // Fatal error
            console.error("[FRONTEND] → Fatal error:", payload.message);
            throw new Error(payload.message);
          }
        }
      }

      console.log("[Client] Stream finished");
      scrollToBottom();
    } catch (err) {
      console.error("[Client] Chat error:", err);
      const errorMsg = err instanceof Error ? err : new Error("Unknown error");
      setError(errorMsg);

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${errorMsg.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
            Powered by Gemini 2.0 Flash • {user.fullName}
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
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

          {messages.map((message) => (
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
                {message.content}
              </p>
            </article>
          ))}

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
          sendMessage(input);
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
              sendMessage(input);
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
