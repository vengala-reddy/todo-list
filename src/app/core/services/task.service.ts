import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CreateTaskDTO, Task, ApiResponse } from '../models/task.model';
import { catchError, map, Observable, of } from 'rxjs';
import { TaskAdapter } from '../patterns/task-adapter';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/todolist/api/v1/user';
  // signals for reactive state management
  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // public readonly access to signals
  readonly tasks = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  createTask(taskData: CreateTaskDTO): Observable<Task | null> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<ApiResponse<Task>>(`${this.baseUrl}/add-list`, taskData).pipe(
      map((response) => {
        this._loading.set(false);
        if (response.success) {
          const newTask = TaskAdapter.toTask(response.data);
          this._tasks.update((tasks) => [...tasks, newTask]);
          return newTask;
        }
        return null;
      }),
      catchError((error) => {
        this._loading.set(false);
        this._error.set(error.error?.message ?? 'Failed to create task');
        return of(null);
      })
    );
  }

  getAllTasks(): Observable<Task[]> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<ApiResponse<Task[]>>(`${this.baseUrl}/list/all`).pipe(
      map((response) => {
        this._loading.set(false);
        if (response.success) {
          const tasks = TaskAdapter.toTaskList(response.data);
          this._tasks.set(tasks);
          return tasks;
        }
        return [];
      }),
      catchError((error) => {
        this._loading.set(false);
        this._error.set(error.error?.message ?? 'Failed to fetch tasks');
        return of([]);
      })
    );
  }

  updateTaskStatus(taskId: number): Observable<Task | null> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.put<ApiResponse<Task>>(`${this.baseUrl}/update/${taskId}`, {}).pipe(
      map((response) => {
        this._loading.set(false);
        if (response.success) {
          const updatedTask = TaskAdapter.toTask(response.data);
          this._tasks.update((tasks) =>
            tasks.map((task) => (task.id === taskId ? updatedTask : task))
          );
          return updatedTask;
        }
        return null;
      }),
      catchError((error) => {
        this._loading.set(false);
        this._error.set(error.error?.message ?? 'Failed to update task status');
        return of(null);
      })
    );
  }
}
