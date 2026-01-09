import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/task-list/task-list.component').then((m) => m.TaskListComponent),
  },
];
