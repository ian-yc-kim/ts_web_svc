import { getToken } from './auth-service';

// Generic API client that attaches auth header and handles errors.
// endpoint should start with a leading slash (e.g. '/auth/login').
export default async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const token = getToken();
    const base = (import.meta.env && (import.meta.env as any).VITE_API_URL) || '';
    const url = `${base}${endpoint}`;

    // Normalize and merge headers
    const headers = new Headers(options.headers as HeadersInit | undefined);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      let message = `${res.status} ${res.statusText}`;
      try {
        const json = await res.json();
        if (json && (json.message || json.error)) {
          message = json.message ?? json.error;
        }
      } catch (_) {
        try {
          const text = await res.text();
          if (text) message = text;
        } catch (_) {
          // ignore
        }
      }
      throw new Error(message);
    }

    // Assume JSON response
    return (await res.json()) as T;
  } catch (error) {
    console.error('api-client:', error);
    throw error;
  }
}
