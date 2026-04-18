import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CalendarDay } from '../../pages/pet-schedule/pet-schedule.models';
import { DayCalendar } from '../day-calendar/day-calendar';

@Component({
  selector: 'app-month-calendar',
  standalone: true,
  imports: [CommonModule, DayCalendar],
  template: `
    <section class="calendar-card">
      <div class="calendar-toolbar">
        <button type="button" class="month-nav" (click)="monthChange.emit(-1)" [disabled]="!canGoToPreviousMonth">
          <i class="bi bi-arrow-left"></i>
        </button>

        <div>
          <h2>{{ monthTitle }}</h2>
        </div>

        <button type="button" class="month-nav" (click)="monthChange.emit(1)">
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>

      <div class="week-days">
        @for (weekDay of weekDays; track weekDay) {
          <span>{{ weekDay }}</span>
        }
      </div>

      <div class="days-grid">
        @for (day of days; track trackByDate($index, day)) {
          <app-day-calendar [day]="day" (daySelected)="dateSelected.emit($event)" />
        }
      </div>
    </section>
  `,
})
export class MonthCalendar {
  @Input() monthTitle = '';
  @Input() weekDays: string[] = [];
  @Input() days: CalendarDay[] = [];
  @Input() canGoToPreviousMonth = false;

  @Output() monthChange = new EventEmitter<number>();
  @Output() dateSelected = new EventEmitter<string>();

  trackByDate(index: number, day: CalendarDay): string {
    return day.isoDate || `placeholder-${index}`;
  }
}
