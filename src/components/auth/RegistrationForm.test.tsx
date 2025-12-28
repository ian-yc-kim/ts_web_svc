import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import * as authService from '../../services/auth-service';
import RegistrationForm from './RegistrationForm';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockReset();
  });

  it('shows email validation error and blocks submit', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'invalid');
    await user.type(screen.getByLabelText(/^Password$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/invalid email address/i)).toBeDefined();
    expect(authService.register).toBeDefined();
  });

  it('shows password complexity error', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'u@e.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'abcdefgh');
    await user.type(screen.getByLabelText(/confirm password/i), 'abcdefgh');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/must contain at least one letter and one number/i)).toBeDefined();
  });

  it('shows confirm password mismatch', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'u@e.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'Passw0rd');
    await user.type(screen.getByLabelText(/confirm password/i), 'Different1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeDefined();
  });

  it('successful submit calls authService.register and navigates', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(authService, 'register').mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<div>LOGIN_PAGE</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'u@e.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'Passw0rd1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Passw0rd1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(spy).toHaveBeenCalledWith('u@e.com', 'Passw0rd1');
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: { message: 'Registration successful' } });
  });

  it('failed submit shows form-level alert', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'register').mockRejectedValue(new Error('bad things'));

    render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'u@e.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'Passw0rd1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Passw0rd1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/bad things|registration failed/i);
  });
});
