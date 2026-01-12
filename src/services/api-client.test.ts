import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock auth-service getToken
vi.mock('./auth-service', () => ({ getToken: vi.fn() }));
import { getToken } from './auth-service';
import apiClient from './api-client';

describe('api-client', () => {
  const globalFetch = global.fetch;

  beforeEach(() => {
    // @ts-ignore
    global.fetch = vi.fn();
    vi.resetAllMocks();
  });

  afterEach(() => {
    // @ts-ignore
    global.fetch = globalFetch;
    vi.restoreAllMocks();
  });

  it('adds Authorization header when token exists', async () => {
    (getToken as any).mockReturnValue('my-token');
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: true, json: async () => ({ success: true }) });

    await apiClient('/test');

    expect((global.fetch as any).mock.calls.length).toBe(1);
    const options = (global.fetch as any).mock.calls[0][1];
    // headers is a Headers instance
    expect(options.headers.get('Authorization')).toBe('Bearer my-token');
  });

  it('does not add Authorization header when token is null', async () => {
    (getToken as any).mockReturnValue(null);
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });

    await apiClient('/noauth');

    const options = (global.fetch as any).mock.calls[0][1];
    expect(options.headers.get('Authorization')).toBeNull();
  });

  it('adds default Content-Type when missing', async () => {
    (getToken as any).mockReturnValue(null);
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });

    await apiClient('/ct');

    const options = (global.fetch as any).mock.calls[0][1];
    expect(options.headers.get('Content-Type')).toBe('application/json');
  });

  it('does not override provided Content-Type', async () => {
    (getToken as any).mockReturnValue(null);

    // capture the fetch call and inspect headers
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });

    await apiClient('/custom', { headers: { 'Content-Type': 'application/custom' } });

    const options = (global.fetch as any).mock.calls[0][1];
    expect(options.headers.get('Content-Type')).toBe('application/custom');
  });

  it('builds url containing endpoint', async () => {
    (getToken as any).mockReturnValue(null);
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });

    await apiClient('/some/endpoint');

    const calledUrl = (global.fetch as any).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/some/endpoint');
  });

  it('throws error with json message when non-ok', async () => {
    (getToken as any).mockReturnValue(null);
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: false, json: async () => ({ message: 'bad' }) });

    await expect(apiClient('/err')).rejects.toThrow('bad');
  });

  it('throws error with text when json parse fails', async () => {
    (getToken as any).mockReturnValue(null);
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: false, json: async () => { throw new Error('no json'); }, text: async () => 'plain-error' });

    await expect(apiClient('/err2')).rejects.toThrow('plain-error');
  });
});
