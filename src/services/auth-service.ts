export async function login(email: string, password: string): Promise<string> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = 'Login failed';
      try {
        const json = await res.json();
        if (json?.message) message = json.message;
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

    const json = await res.json();
    // Common response shapes: { token } or { accessToken }
    const token = (json && (json.token ?? json.accessToken)) as string | undefined;
    if (!token) {
      throw new Error('Login succeeded but no token returned');
    }

    try {
      localStorage.setItem('ts_token', token);
    } catch (err) {
      console.error('auth-service: failed to persist token', err);
    }

    return token;
  } catch (error) {
    console.error('auth-service:', error);
    throw error;
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem('ts_token');
  } catch (error) {
    console.error('auth-service:getToken', error);
    return null;
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem('ts_token');
  } catch (error) {
    console.error('auth-service:clearToken', error);
  }
}
