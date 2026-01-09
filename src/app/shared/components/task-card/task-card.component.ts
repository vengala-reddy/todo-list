import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import { Task } from "../../../core/models/task.model";

@Component({
  selector: "app-task-card",
  templateUrl: "./task-card.component.html",
  styleUrl: "./task-card.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  // Input signal - receives task from parent
  task = input.required<Task>();
  // Output - notifies parent when status update is requested
  statusUpdate = output<number>();
  // computed val for better performance
  isOverdue = computed(() => {
    const endDate = new Date(this.task().endDate);
    return endDate < new Date() && this.task().status !== 'COMPLETED';
  });
  isCompleted = computed(() => this.task().status === 'COMPLETED');
  onUpdateStatus() {
    this.statusUpdate.emit(this.task().id);
  }
}
