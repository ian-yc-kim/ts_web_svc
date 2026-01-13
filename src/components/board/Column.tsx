import React from 'react';
import type { Task } from '../../types/board';

export interface ColumnProps {
  title: string;
  count: number;
  tasks: Task[];
}

export const Column = ({ title, count, tasks }: ColumnProps) => {
  return (
    <section data-testid="column" className="column">
      <div className="column__header">
        <h3 className="column__title">{title}</h3>
        <span aria-label="count" className="column__count">{count}</span>
      </div>

      <div className="column__tasks" data-testid="task-list">
        {tasks.map((task) => (
          <div key={task.id} data-testid="task-item" className="task-item">
            {task.title}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Column;
