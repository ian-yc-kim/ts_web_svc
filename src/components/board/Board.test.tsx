import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../../services/board-service', () => ({
  default: {
    fetchBoard: vi.fn(),
  },
}));

import boardService from '../../services/board-service';
import Board from './Board';

describe('Board', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state while fetching', async () => {
    // fetchBoard returns a promise that never resolves to simulate loading
    (boardService as any).fetchBoard.mockImplementation(() => new Promise(() => {}));

    render(<Board />);

    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it('shows error when fetch fails', async () => {
    (boardService as any).fetchBoard.mockRejectedValue(new Error('boom'));
    render(<Board />);

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

    render(<Board />);

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

    render(<Board />);

    await waitFor(() => expect(screen.getByRole('status')).toBeDefined());
    expect(screen.getByRole('status')).toHaveTextContent(/no board data available/i);
  });
});
