import { describe, it, expect, vi, beforeEach } from 'vitest';
import socketService from './socket-service';

// Use a controllable fake WebSocket implementation
let constructedInstances: any[] = [];

class FakeWebSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  public readyState: number = FakeWebSocket.OPEN;
  public url: string;
  public onmessage: ((ev: { data: string }) => void) | null = null;
  public onerror: ((err: any) => void) | null = null;
  public onclose: (() => void) | null = null;
  public closeCalled = false;

  constructor(url: string) {
    this.url = url;
    constructedInstances.push(this);
  }

  close() {
    this.closeCalled = true;
    if (this.onclose) this.onclose();
  }
}

describe('SocketService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    constructedInstances = [];
    // Stub environment variable
    vi.stubEnv('VITE_API_URL', 'http://localhost:8000');
    // Provide global WebSocket
    (globalThis as any).WebSocket = FakeWebSocket as any;
    // Ensure disconnected state before each test
    try {
      socketService.disconnect();
    } catch (_) {
      // ignore
    }
  });

  it('connects and creates WebSocket with ws protocol and /ws path', () => {
    socketService.connect('token123');
    expect(constructedInstances.length).toBe(1);
    const inst = constructedInstances[0];
    expect(inst.url).toBe('ws://localhost:8000/ws?token=token123');
  });

  it('is idempotent when connecting with same token', () => {
    socketService.connect('same');
    socketService.connect('same');
    expect(constructedInstances.length).toBe(1);
  });

  it('disconnect closes the socket and clears internal socket', () => {
    socketService.connect('d1');
    const inst = constructedInstances[0];
    expect(inst.closeCalled).toBe(false);
    socketService.disconnect();
    expect(inst.closeCalled).toBe(true);
    // internal socket should be null
    expect((socketService as any).socket).toBeNull();
  });

  it('dispatches onmessage to subscribers matching event', () => {
    socketService.connect('d2');
    const inst = constructedInstances[0];

    const cb = vi.fn();
    const other = vi.fn();
    socketService.subscribe('board_update', cb);
    socketService.subscribe('other_event', other);

    const payload = { a: 1 };
    const message = JSON.stringify({ event: 'board_update', data: payload });

    // Simulate incoming message
    if (inst.onmessage) inst.onmessage({ data: message });

    expect(cb).toHaveBeenCalledWith(payload);
    expect(other).not.toHaveBeenCalled();
  });

  it('unsubscribe prevents receiving events', () => {
    socketService.connect('d3');
    const inst = constructedInstances[0];

    const cb = vi.fn();
    socketService.subscribe('board_update', cb);
    socketService.unsubscribe('board_update', cb);

    const message = JSON.stringify({ event: 'board_update', data: { ok: true } });
    if (inst.onmessage) inst.onmessage({ data: message });

    expect(cb).not.toHaveBeenCalled();
  });
});
