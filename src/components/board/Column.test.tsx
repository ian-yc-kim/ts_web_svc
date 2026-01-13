import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Column } from './Column';
import type { Task } from '../../types/board';

describe('Column', () => {
  it('renders title, count and tasks', () => {
    const tasks: Task[] = [
      { id: 't1', title: 'Task One', status: 'todo', position: 0 },
      { id: 't2', title: 'Task Two', status: 'todo', position: 1 },
    ];

    render(<Column title="To Do" count={tasks.length} tasks={tasks} />);

    expect(screen.getByText(/to do/i)).toBeDefined();
    expect(screen.getByLabelText('count')).toHaveTextContent(String(tasks.length));

    const renderedTasks = screen.getAllByTestId('task-item');
    expect(renderedTasks).toHaveLength(2);
    expect(screen.getByText('Task One')).toBeDefined();
    expect(screen.getByText('Task Two')).toBeDefined();
  });
});
