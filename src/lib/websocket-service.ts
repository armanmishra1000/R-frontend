import { mockServer, MockServer } from './mock-server';

type Event = 'connection_ack' | 'message.created' | 'message.reconciled' | 'typing.update' | 'presence.update';
type Listener = (data: any) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private server: MockServer = mockServer;
  private listeners: Map<Event, Listener[]> = new Map();
  private subscriptions: Set<string> = new Set();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;

  private constructor() {
    this.connect();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect() {
    console.log("Attempting to connect to WebSocket...");
    this.server.connect(this.handleEvent.bind(this), this.handleDisconnect.bind(this));
    this.isConnected = true;
    this.reconnectAttempts = 0;
    console.log("WebSocket connection established.");
    this.emit('connection_ack', { status: 'connected' });
    this.resubscribe();
  }

  private handleDisconnect() {
    this.isConnected = false;
    console.warn("WebSocket disconnected. Attempting to reconnect...");
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000); // Exponential backoff
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private resubscribe() {
    if (this.subscriptions.size > 0) {
      console.log("Resubscribing to channels:", Array.from(this.subscriptions));
      this.subscriptions.forEach(channel => {
        this.send('subscribe', { channel });
      });
    }
  }

  private handleEvent(event: Event, data: any) {
    this.emit(event, data);
  }

  on(event: Event, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: Event, listener: Listener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(l => l !== listener));
    }
  }

  private emit(event: Event, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  send(type: string, payload: any) {
    if (!this.isConnected) {
      console.error("Cannot send message, WebSocket is not connected.");
      return;
    }
    this.server.receive({ type, payload });
  }

  subscribe(channel: string) {
    if (this.subscriptions.has(channel)) return;
    this.subscriptions.add(channel);
    this.send('subscribe', { channel });
    console.log(`Subscribed to ${channel}`);
  }

  unsubscribe(channel: string) {
    this.subscriptions.delete(channel);
    // In a real scenario, you might send an 'unsubscribe' message.
    console.log(`Unsubscribed from ${channel}`);
  }
}

export const websocketService = WebSocketService.getInstance();