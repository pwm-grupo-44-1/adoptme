import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UpcomingBookingView } from '../../pages/pet-schedule/pet-schedule.models';
import { CancelBookingButton } from '../cancel-booking-button/cancel-booking-button';

@Component({
  selector: 'app-upcoming-bookings',
  standalone: true,
  imports: [CommonModule, CancelBookingButton],
  template: `
    <section class="bookings-card">
      <div class="section-head">
        <div>
          <p class="section-label">Tus reservas</p>
          <h2>Proximas citas</h2>
        </div>
        <span class="availability-pill">{{ bookings.length }} activas</span>
      </div>

      @if (bookings.length === 0) {
        <p class="empty-state">
          Aun no has creado citas en este navegador.
        </p>
      } @else {
        <div class="booking-list">
          @for (booking of bookings; track booking.id) {
            <article class="booking-item">
              <div>
                <p class="booking-date">{{ booking.dateLabel }}</p>
                <p class="booking-meta">{{ booking.metaLabel }}</p>
                <p class="booking-contact">{{ booking.contactLabel }}</p>
                <span
                  class="booking-status-chip"
                  [class.confirmed]="booking.statusTone === 'confirmed'"
                  [class.rejected]="booking.statusTone === 'rejected'"
                  [class.pending]="booking.statusTone === 'pending'"
                >
                  {{ booking.statusLabel }}
                </span>
              </div>

              <app-cancel-booking-button (clicked)="cancelBooking.emit(booking.id)" />
            </article>
          }
        </div>
      }
    </section>
  `,
})
export class UpcomingBookings {
  @Input() bookings: UpcomingBookingView[] = [];

  @Output() cancelBooking = new EventEmitter<string>();
}
