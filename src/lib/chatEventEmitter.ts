// Simple in-memory event emitter for SSE in local development
// Note: In production (serverless/edge), use Redis or Pusher.

type Listener = (message: any) => void;

class ChatEventEmitter {
  private listeners: Map<string, Set<Listener>> = new Map();

  subscribe(sessionId: string, listener: Listener) {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, new Set());
    }
    this.listeners.get(sessionId)!.add(listener);

    return () => {
      this.listeners.get(sessionId)?.delete(listener);
      if (this.listeners.get(sessionId)?.size === 0) {
        this.listeners.delete(sessionId);
      }
    };
  }

  emit(sessionId: string, message: any) {
    const sessionListeners = this.listeners.get(sessionId);
    if (sessionListeners) {
      sessionListeners.forEach(listener => listener(message));
    }
    
    // Also emit to an 'ADMIN' channel so admins can hear all incoming messages
    const adminListeners = this.listeners.get('ADMIN');
    if (adminListeners) {
      adminListeners.forEach(listener => listener(message));
    }
  }
}

// Global instance to survive HMR in dev
const globalForChat = global as unknown as { chatEmitter: ChatEventEmitter };

export const chatEmitter = globalForChat.chatEmitter || new ChatEventEmitter();

if (process.env.NODE_ENV !== 'production') globalForChat.chatEmitter = chatEmitter;
