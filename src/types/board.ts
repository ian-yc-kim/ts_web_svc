export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  position: number;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  order: number;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}
