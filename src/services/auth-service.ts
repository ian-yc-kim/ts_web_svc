export async function login(email: string, password: string): Promise<void> {
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
        const text = await res.text();
        if (text) message = text;
      }
      throw new Error(message);
    }

    // Successful login could return token/user. Persisting handled by AuthContext or higher layer.
    return;
  } catch (error) {
    console.error('auth-service:', error);
    throw error;
  }
}
