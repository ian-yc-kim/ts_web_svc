import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Prevent real WebSocket interactions during component tests
vi.mock('../../hooks/useBoardSocket', () => ({
  default: vi.fn(),
}));

vi.mock('../../services/socket-service', () => ({
  default: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

vi.mock('../../services/board-service', () => ({
  default: {
    fetchBoard: vi.fn(),
  },
}));

import boardService from '../../services/board-service';
import Board from './Board';
import { renderWithAuth } from '../../test/utils';

describe('Board', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const authValue = {
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  } as any;

  it('shows loading state while fetching', async () => {
    // fetchBoard returns a promise that never resolves to simulate loading
    (boardService as any).fetchBoard.mockImplementation(() => new Promise(() => {}));

    renderWithAuth(<Board />, authValue);

    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it('shows error when fetch fails', async () => {
    (boardService as any).fetchBoard.mockRejectedValue(new Error('boom'));
    renderWithAuth(<Board />, authValue);

    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
    expect(screen.getByRole('alert')).toHaveTextContent(/boom/);
  });

  it('renders three columns on success with tasks', async () => {
    const board = {
      id: 'b1',
      title: 'B',
      columns: [
        { id: 'c1', title: 'To Do', tasks: [{ id: 't1', title: 'Task 1', status: 'todo', position: 0 }], order: 0 },
        { id: 'c2', title: 'In Progress', tasks: [{ id: 't2', title: 'Task 2', status: 'inprogress', position: 0 }], order: 1 },
        { id: 'c3', title: 'Done', tasks: [{ id: 't3', title: 'Task 3', status: 'done', position: 0 }], order: 2 },
      ],
    };

    (boardService as any).fetchBoard.mockResolvedValue(board);

    renderWithAuth(<Board />, authValue);

    // Wait for columns to appear
    await waitFor(() => expect(screen.getByText(/to do/i)).toBeDefined());
    expect(screen.getByText(/in progress/i)).toBeDefined();
    expect(screen.getByText(/done/i)).toBeDefined();

    // tasks exist
    expect(screen.getByText('Task 1')).toBeDefined();
    expect(screen.getByText('Task 2')).toBeDefined();
    expect(screen.getByText('Task 3')).toBeDefined();
  });

  it('shows empty state when no columns', async () => {
    const board = { id: 'b2', title: 'Empty', columns: [] };
    (boardService as any).fetchBoard.mockResolvedValue(board);

    renderWithAuth(<Board />, authValue);

    await waitFor(() => expect(screen.getByRole('status')).toBeDefined());
    expect(screen.getByRole('status')).toHaveTextContent(/no board data available/i);
  });
});
