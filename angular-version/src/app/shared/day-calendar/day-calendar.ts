import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CalendarDay } from '../../pages/pet-schedule/pet-schedule.models';

@Component({
  selector: 'app-day-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (day.isPlaceholder) {
      <div class="day-cell placeholder" aria-hidden="true"></div>
    } @else {
      <button
        type="button"
        class="day-cell"
        [class.selected]="day.isSelected"
        [class.today]="day.isToday"
        [class.disabled]="day.isDisabled"
        [disabled]="day.isDisabled"
        (click)="daySelected.emit(day.isoDate)"
      >
        <span class="day-number">{{ day.dayNumber }}</span>
        <small>{{ day.freeSlots }} libres</small>
      </button>
    }
  `,
})
export class DayCalendar {
  @Input({ required: true }) day!: CalendarDay;

  @Output() daySelected = new EventEmitter<string>();
}
