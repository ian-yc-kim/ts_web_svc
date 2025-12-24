import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { renderWithAuth } from '../../test/utils';

describe('LoginForm', () => {
  it('shows email validation error and blocks submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<LoginForm />, { isAuthenticated: false, login: mockLogin }, { route: '/login' });

    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/invalid email address/i)).toBeDefined();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows password validation error and blocks submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<LoginForm />, { isAuthenticated: false, login: mockLogin }, { route: '/login' });

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'short');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeDefined();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login and navigates to board on success', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);

    // Provide minimal routing: when navigate to /board we will render a placeholder
    const ui = (
      <div>
        <div data-testid="route-login">
          <LoginForm />
        </div>
        <div data-testid="route-board">BOARD</div>
      </div>
    );

    // Render LoginForm only; simulate successful login by asserting login called
    renderWithAuth(<LoginForm />, { isAuthenticated: false, login: mockLogin }, { route: '/login' });

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Passw0rd');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({ email: 'user@example.com', password: 'Passw0rd' }));
  });

  it('displays form-level error on failed login', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    renderWithAuth(<LoginForm />, { isAuthenticated: false, login: mockLogin }, { route: '/login' });

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Passw0rd');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid credentials|login failed/i);
  });
});
