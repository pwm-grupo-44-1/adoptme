import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SlotState } from '../../pages/pet-schedule/pet-schedule.models';

@Component({
  selector: 'app-available-slots',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="slots-card">
      <div class="section-head">
        <div>
          <div class="availability-label-row">
            <p class="section-label">Disponibilidad</p>
          </div>
          <h2>{{ selectedDate ? selectedDateLabel : 'Sin fecha activa' }}</h2>
        </div>
      </div>

      @if (!selectedDate) {
        <p class="empty-state">
          No quedan huecos en este mes. Prueba con el siguiente mes para seguir reservando.
        </p>
      } @else {
        <div class="slots-grid">
          @for (slot of slots; track slot.time) {
            <button
              type="button"
              class="slot-chip"
              [class.selected]="selectedSlot === slot.time"
              [class.booked]="slot.isBooked"
              [class.expired]="slot.isExpired"
              [disabled]="slot.isBooked || slot.isExpired"
              (click)="slotSelected.emit(slot)"
            >
              <span>{{ slot.time }}</span>
              <small>
                @if (slot.isBooked) {
                  Reservado
                } @else if (slot.isExpired) {
                  No disponible
                } @else {
                  Disponible
                }
              </small>
            </button>
          }
        </div>
      }
    </section>
  `,
})
export class AvailableSlots {
  @Input() selectedDate = '';
  @Input() selectedDateLabel = '';
  @Input() selectedSlot = '';
  @Input() slots: SlotState[] = [];

  @Output() slotSelected = new EventEmitter<SlotState>();
}
