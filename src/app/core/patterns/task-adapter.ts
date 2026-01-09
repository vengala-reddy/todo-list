import { Task, TaskStatus } from "../models/task.model";

interface RawTaskData {
  id: number;
  task_name?: string;
  taskName?: string;
  description: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  status: string;
  effort_required?: number;
  effortRequired?: number;
  created_at?: string;
  createdAt?: string;
}

export class TaskAdapter {
  static toTask(raw: RawTaskData) {
    return {
      id: raw.id,
      taskName: raw.task_name ?? raw.taskName ?? '',
      description: raw.description,
      startDate: raw.start_date ?? raw.startDate ?? '',
      endDate: raw.end_date ?? raw.endDate ?? '',
      status: TaskAdapter.normalizeStatus(raw.status),
      effortRequired: raw.effort_required ?? raw.effortRequired ?? 0,
      createdAt: raw.created_at ?? raw.createdAt,
    };
  }

  private static normalizeStatus(status: string) {
    const normalized = status?.toUpperCase() as TaskStatus;
    const validStatuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    return validStatuses.includes(normalized) ? normalized : 'PENDING';
  }

  static toTaskList(rawList: RawTaskData[]) {
    return rawList.map(raw => this.toTask(raw));
  }

  static formatForDisplay(task: Task): Task & {isOverdue: boolean; daysRemaining: number} {
    const today = new Date();
    const endDate = new Date(task.endDate);
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      ...task,
      isOverdue: daysRemaining < 0 && task.status !== 'COMPLETED',
      daysRemaining
    };
  }
}
