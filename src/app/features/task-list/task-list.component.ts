import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { TaskService } from '../../core/services/task.service';
import { CreateTaskDTO, TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TaskCardComponent],
})
export class TaskListComponent implements OnInit{
  private readonly taskService = inject(TaskService);
  private readonly fb = inject(FormBuilder);

  // Form for creating new tasks
  taskForm: FormGroup = this.fb.group({
    taskName: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.required]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    status: ['PENDING' as TaskStatus, [Validators.required]],
    effortRequired: [0, [Validators.min(1)]],
  });

  // Local UI state
  private readonly _showForm = signal(false);
  showForm = this._showForm.asReadonly();

  // Derived state from service signals
  tasks = this.taskService.tasks;
  loading = this.taskService.loading;
  error = this.taskService.error;

  // computed: total effort of all tasks
  totalEffort = computed(() =>
    this.tasks().reduce((sum, task) => sum + task.effortRequired, 0)
  );

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getAllTasks().subscribe();
  }
  toggleForm() {
    this._showForm.update(show => !show);
  }

  onSubmit() {
    if (this.taskForm.valid) {
      // validate dates before submission
      const formValue = this.taskForm.value;
      const startDate = new Date(formValue.startDate);
      const endDate = new Date(formValue.endDate);

      if(endDate < startDate) {
        alert('End date must be after start date.');
        return;
      }

      const taskData: CreateTaskDTO = {
        taskName: formValue.taskName.trim(),
        description: formValue.description.trim(),
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        status: formValue.status,
        effortRequired: Number(formValue.effortRequired),
      };

      this.taskService.createTask(taskData).subscribe((result) => {
        if (result) {
          this.taskForm.reset({ status: 'PENDING', effortRequired: 0 });
          this._showForm.set(false);
        }
      });
    } else {
      // mark all fields as touched to show validation errors
      Object.keys(this.taskForm.controls).forEach(key => {
        this.taskForm.controls[key].markAsTouched();
      });
    }
  }

  onUpdateStatus(taskId: number) {
    this.taskService.updateTaskStatus(taskId).subscribe();
  }

  // Helper method for template check
  hasError(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getErorMessage(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if(field?.errors?.['required']) return `${fieldName} is required.`;
    if(field?.errors?.['maxlength']) return `${fieldName} exceeds maximum length.`;
    if(field?.errors?.['min']) return `${fieldName} must be greater than zero.`;
    return '';
  }

  // trackby function for @for loop(Performance optimization)
  trackByTaskId(task: {id: number}): number {
    return task.id;
  }
}
