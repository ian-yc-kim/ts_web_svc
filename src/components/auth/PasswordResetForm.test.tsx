import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as authService from '../../services/auth-service';
import PasswordResetForm from './PasswordResetForm';

describe('PasswordResetForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('invalid email blocks submit', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PasswordResetForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'invalid');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(/invalid email address/i)).toBeDefined();
  });

  it('successful submit calls service and shows status', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'requestPasswordReset').mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <PasswordResetForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'ok@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/If an account exists, a reset link has been sent/i);
  });

  it('failed submit shows alert', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'requestPasswordReset').mockRejectedValue(new Error('failed'));

    render(
      <MemoryRouter>
        <PasswordResetForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'fail@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed|request failed/i);
  });
});
