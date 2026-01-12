import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../../core/services/task.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let mockTaskService: Partial<TaskService>;

  beforeEach(async () => {
    mockTaskService = {
      tasks: signal([]),
      loading: signal(false),
      error: signal(null),
      getAllTasks: vi.fn().mockReturnValue(of([])),
      createTask: vi.fn().mockReturnValue(of(null)),
      updateTaskStatus: vi.fn().mockReturnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TaskService, useValue: mockTaskService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', () => {
    expect(mockTaskService.getAllTasks).toHaveBeenCalled();
  });

  it('should validate required fields', () => {
    component.onSubmit();
    expect(component.taskForm.valid).toBe(false);
  });

  it('should reject effort <= 0', () => {
    component.taskForm.patchValue({
      taskName: 'Test',
      description: 'Test desc',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: 'PENDING',
      effortRequired: 0,
    });

    expect(component.taskForm.valid).toBe(false);
    expect(component.taskForm.get('effortRequired')?.errors?.['min']).toBeTruthy();
  });

  it('should accept valid form data', () => {
    component.taskForm.patchValue({
      taskName: 'Test Task',
      description: 'Test Description',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: 'PENDING',
      effortRequired: 5,
    });

    expect(component.taskForm.valid).toBe(true);
  });
});
