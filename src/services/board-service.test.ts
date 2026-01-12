import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api-client', () => ({ default: vi.fn() }));
import apiClient from './api-client';
import { fetchBoard } from './board-service';

describe('board-service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls apiClient with /boards/default and returns board', async () => {
    const board = { id: 'b1', title: 'B', columns: [] };
    (apiClient as any).mockResolvedValue(board);

    const result = await fetchBoard();

    expect(apiClient).toHaveBeenCalledWith('/boards/default');
    expect(result).toEqual(board);
  });

  it('re-throws error from apiClient', async () => {
    (apiClient as any).mockRejectedValue(new Error('down'));
    await expect(fetchBoard()).rejects.toThrow('down');
  });
});
