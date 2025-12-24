import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../contexts/AuthContext';

export const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);

export const renderWithAuth = (
  ui: React.ReactElement,
  authValue: AuthContextValue,
  { route = '/' } = {}
) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={authValue}>{ui}</AuthContext.Provider>
    </MemoryRouter>
  );
