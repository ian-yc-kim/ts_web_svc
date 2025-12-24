import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithAuth } from '../../test/utils';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to /login', () => {
    const auth = {
      isAuthenticated: false,
      login: async () => {},
      logout: () => {},
    };

    renderWithAuth(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/board"
          element={
            <ProtectedRoute>
              <div>Protected</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      auth,
      { route: '/board' }
    );

    expect(screen.getByText(/login page/i)).toBeDefined();
  });

  it('renders children for authenticated users', () => {
    const auth = {
      isAuthenticated: true,
      login: async () => {},
      logout: () => {},
    };

    renderWithAuth(
      <Routes>
        <Route
          path="/board"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      auth,
      { route: '/board' }
    );

    expect(screen.getByText(/protected content/i)).toBeDefined();
  });
});
