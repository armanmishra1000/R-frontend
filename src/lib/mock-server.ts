import { chats as initialChats, currentUser, users as initialUsers, Chat, Message, User } from "@/data/mock-data";
import { produce } from "immer";

type ClientCallback = (event: string, data: any) => void;
type DisconnectCallback = () => void;

class MockServer {
  private client: ClientCallback | null = null;
  private disconnectCallback: DisconnectCallback | null = null;
  private chats: Chat[] = structuredClone(initialChats);
  private users: User[] = structuredClone(initialUsers);
  private typingTimers: Map<string, NodeJS.Timeout> = new Map();
  private presenceIntervalId: NodeJS.Timeout | undefined;
  private connectionIntervalId: NodeJS.Timeout | undefined;

  constructor() {
    this.presenceIntervalId = this.simulatePresenceChanges();
    this.connectionIntervalId = this.simulateConnectionDrops();
  }

  public cleanup() {
    if (this.presenceIntervalId) {
      clearInterval(this.presenceIntervalId);
      this.presenceIntervalId = undefined;
    }
    if (this.connectionIntervalId) {
      clearInterval(this.connectionIntervalId);
      this.connectionIntervalId = undefined;
    }
    this.typingTimers.forEach(timer => clearTimeout(timer));
    this.typingTimers.clear();
    console.log("MockServer cleaned up.");
  }

  connect(clientCallback: ClientCallback, disconnectCallback: DisconnectCallback) {
    this.client = clientCallback;
    this.disconnectCallback = disconnectCallback;
  }

  receive(message: { type: string; payload: any }) {
    const { type, payload } = message;
    switch (type) {
      case 'subscribe':
        // Acknowledge subscription, maybe send initial data
        break;
      case 'message.create':
        this.handleCreateMessage(payload);
        break;
      case 'typing.start':
        this.handleTypingUpdate(payload.chatId, currentUser.id, true);
        break;
      case 'typing.stop':
        this.handleTypingUpdate(payload.chatId, currentUser.id, false);
        break;
    }
  }

  private emit(event: string, data: any) {
    // Simulate network delay
    setTimeout(() => this.client?.(event, data), Math.random() * 300 + 50);
  }

  private handleCreateMessage(payload: { chatId: string; tempId: string; content: string }) {
    const { chatId, tempId, content } = payload;

    // Simulate processing delay
    setTimeout(() => {
      const finalMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      this.chats = produce(this.chats, draft => {
        const chat = draft.find(c => c.id === chatId);
        if (chat) {
          chat.messages.push(finalMessage);
        }
      });

      this.emit('message.reconciled', { chatId, tempId, finalMessage });
      this.simulateReply(chatId);
    }, 1000);
  }

  private simulateReply(chatId: string) {
    setTimeout(() => {
      const chat = this.chats.find(c => c.id === chatId);
      if (!chat) return;

      const otherUser = chat.participants.find(p => p.id !== currentUser.id && p.presence === 'online');
      if (!otherUser) return;

      const otherUserSnapshot = { id: otherUser.id, name: otherUser.name };

      // Simulate typing from the other user
      this.handleTypingUpdate(chatId, otherUserSnapshot.id, true);
      setTimeout(() => {
        this.handleTypingUpdate(chatId, otherUserSnapshot.id, false);
        const replyMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId: otherUserSnapshot.id,
          content: "This is a simulated real-time reply!",
          timestamp: new Date().toISOString(),
          status: 'delivered',
        };

        this.chats = produce(this.chats, draft => {
          const chat = draft.find(c => c.id === chatId);
          if (chat) {
            chat.messages.push(replyMessage);
          }
        });

        this.emit('message.created', { chatId, message: replyMessage });
      }, 2000);
    }, 1500);
  }

  private handleTypingUpdate(chatId: string, userId: string, isTyping: boolean) {
    const key = `${chatId}-${userId}`;
    if (this.typingTimers.has(key)) {
      clearTimeout(this.typingTimers.get(key)!);
      this.typingTimers.delete(key);
    }

    if (isTyping) {
      const timer = setTimeout(() => {
        this.emit('typing.update', { chatId, userId, isTyping: false });
        this.typingTimers.delete(key);
      }, 3000); // Stop typing if no update for 3s
      this.typingTimers.set(key, timer);
    }
    
    this.emit('typing.update', { chatId, userId, isTyping });
  }

  private simulatePresenceChanges(): NodeJS.Timeout {
    return setInterval(() => {
      const userToChange = this.users.find(u => u.id !== currentUser.id);
      if (userToChange) {
        const oldStatus = userToChange.presence;
        userToChange.presence = oldStatus === 'online' ? 'offline' : 'online';
        this.emit('presence.update', { userId: userToChange.id, presence: userToChange.presence });
      }
    }, 10000); // Change a user's presence every 10 seconds
  }

  private simulateConnectionDrops(): NodeJS.Timeout {
    return setInterval(() => {
      console.warn("Simulating connection drop...");
      this.disconnectCallback?.();
    }, 45000); // Drop connection every 45 seconds
  }
}

export const mockServer = new MockServer();
export type { MockServer };