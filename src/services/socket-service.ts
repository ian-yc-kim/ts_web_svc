type Subscriber = (payload: unknown) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private currentToken: string | null = null;
  private subscribers: Map<string, Set<Subscriber>> = new Map();

  connect(token: string): void {
    try {
      if (!token) return;

      if (typeof WebSocket === 'undefined') {
        console.error('SocketService: WebSocket not available in this environment');
        return;
      }

      // If same token and socket is open or connecting, do nothing
      if (
        this.socket &&
        this.currentToken === token &&
        (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      // If there's an existing socket (different token or closed), disconnect first
      if (this.socket) this.disconnect();

      const base = (import.meta.env && (import.meta.env as any).VITE_API_URL) || '';
      let wsUrl = base.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
      wsUrl = `${wsUrl}/ws`;
      const sep = wsUrl.includes('?') ? '&' : '?';
      wsUrl = `${wsUrl}${sep}token=${encodeURIComponent(token)}`;

      const socket = new WebSocket(wsUrl);
      this.socket = socket;
      this.currentToken = token;

      socket.onmessage = (ev: MessageEvent) => {
        try {
          const raw = ev?.data;
          if (!raw) return;
          let msg: unknown;
          try {
            msg = JSON.parse(raw);
          } catch (_) {
            // If not JSON, ignore
            return;
          }

          const obj = msg as Record<string, unknown>;
          const eventName = typeof obj.event === 'string' ? obj.event : typeof obj.type === 'string' ? obj.type : null;
          if (!eventName) return;

          const payload = obj.data ?? obj.payload ?? msg;

          const set = this.subscribers.get(eventName);
          if (!set) return;

          for (const cb of Array.from(set)) {
            try {
              cb(payload);
            } catch (err) {
              console.error('SocketService:', err);
            }
          }
        } catch (error) {
          console.error('SocketService:', error);
        }
      };

      socket.onerror = (err) => {
        console.error('SocketService:', err);
      };

      socket.onclose = () => {
        // ensure we clear references
        this.socket = null;
        this.currentToken = null;
      };
    } catch (error) {
      console.error('SocketService:', error);
    }
  }

  disconnect(): void {
    try {
      if (this.socket) {
        try {
          this.socket.close();
        } catch (err) {
          console.error('SocketService:', err);
        }
      }
    } catch (error) {
      console.error('SocketService:', error);
    } finally {
      this.socket = null;
      this.currentToken = null;
    }
  }

  subscribe(event: string, callback: Subscriber): void {
    try {
      const set = this.subscribers.get(event) ?? new Set<Subscriber>();
      set.add(callback);
      this.subscribers.set(event, set);
    } catch (error) {
      console.error('SocketService:', error);
    }
  }

  unsubscribe(event: string, callback: Subscriber): void {
    try {
      const set = this.subscribers.get(event);
      if (!set) return;
      set.delete(callback);
      if (set.size === 0) this.subscribers.delete(event);
    } catch (error) {
      console.error('SocketService:', error);
    }
  }
}

const socketService = new SocketService();
export default socketService;
