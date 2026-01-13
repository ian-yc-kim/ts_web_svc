import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Board as BoardType, Column as ColumnType } from '../../types/board';
import boardService from '../../services/board-service';
import { Column } from './Column';
import './Board.css';
import useBoardSocket from '../../hooks/useBoardSocket';
import socketService from '../../services/socket-service';

export const Board = () => {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useBoardSocket();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchBoard = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      if (isMountedRef.current) setLoading(true);
      if (isMountedRef.current) setError(null);

      const b = await boardService.fetchBoard();
      if (isMountedRef.current) setBoard(b);
    } catch (err: unknown) {
      console.error('Board:', err);
      const message = err instanceof Error ? err.message : 'Failed to load board';
      if (isMountedRef.current) setError(message);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBoard();
  }, [fetchBoard]);

  useEffect(() => {
    const handler = () => {
      void fetchBoard();
    };

    socketService.subscribe('board_update', handler);
    return () => {
      socketService.unsubscribe('board_update', handler);
    };
  }, [fetchBoard]);

  const renderEmpty = () => (
    <div role="status" className="board__empty">
      No board data available. Create columns and tasks to get started.
    </div>
  );

  if (loading) return <div className="board__loading">Loading…</div>;
  if (error) return <div role="alert" className="board__error">{error}</div>;
  if (!board || !board.columns || board.columns.length === 0) return renderEmpty();

  // Determine columns for fixed positions
  const fixedTitles = ['To Do', 'In Progress', 'Done'];
  const columnsByLowerTitle = new Map<string, ColumnType>();
  for (const col of board.columns) {
    columnsByLowerTitle.set(col.title.toLowerCase(), col);
  }

  // Fallback ordering by 'order' field
  const fallback = [...board.columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const mappedColumns = fixedTitles.map((ftitle, idx) => {
    const found = columnsByLowerTitle.get(ftitle.toLowerCase());
    if (found) return found;
    return (fallback[idx] ?? { id: `empty-${idx}`, title: ftitle, tasks: [], order: idx }) as ColumnType;
  });

  return (
    <div className="board">
      <div className="board__columns">
        {mappedColumns.map((col) => (
          <Column key={col.id} title={col.title} count={col.tasks?.length ?? 0} tasks={col.tasks ?? []} />
        ))}
      </div>
    </div>
  );
};

export default Board;
