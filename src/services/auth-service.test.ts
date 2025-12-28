import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import * as authService from './auth-service';

describe('auth-service', () => {
  const globalFetch = global.fetch;

  beforeEach(() => {
    // @ts-ignore
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // @ts-ignore
    global.fetch = globalFetch;
    vi.restoreAllMocks();
  });

  it('register calls correct endpoint with body', async () => {
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });
    await authService.register('a@b.com', 'Password1');
    expect((global.fetch as any).mock.calls.length).toBe(1);
    const calledUrl = (global.fetch as any).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/auth/register');
    const options = (global.fetch as any).mock.calls[0][1];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ email: 'a@b.com', password: 'Password1' });
  });

  it('register throws with json error message when non-ok', async () => {
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: false, json: async () => ({ message: 'bad' }) });
    await expect(authService.register('a@b.com', 'Password1')).rejects.toThrow('bad');
  });

  it('requestPasswordReset calls correct endpoint', async () => {
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });
    await authService.requestPasswordReset('c@d.com');
    expect((global.fetch as any).mock.calls.length).toBe(1);
    const calledUrl = (global.fetch as any).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/auth/request-password-reset');
    const options = (global.fetch as any).mock.calls[0][1];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ email: 'c@d.com' });
  });

  it('requestPasswordReset throws when text response present', async () => {
    // @ts-ignore
    (global.fetch as any).mockResolvedValue({ ok: false, json: async () => { throw new Error('no json'); }, text: async () => 'text-error' });
    await expect(authService.requestPasswordReset('e@f.com')).rejects.toThrow('text-error');
  });
});
