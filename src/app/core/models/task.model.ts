export interface Task {
  id: number;
  taskName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  effortRequired: number;
  createdAt?: string;
}
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface CreateTaskDTO {
  taskName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  effortRequired: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

