import apiClient from './api-client';
import type { Board } from '../types/board';

export async function fetchBoard(): Promise<Board> {
  try {
    return await apiClient<Board>('/boards/default');
  } catch (error) {
    console.error('board-service:fetchBoard', error);
    throw error;
  }
}

export default { fetchBoard };
