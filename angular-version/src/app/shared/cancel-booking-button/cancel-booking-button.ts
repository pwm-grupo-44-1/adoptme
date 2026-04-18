import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-cancel-booking-button',
  standalone: true,
  template: `
    <button type="button" class="cancel-btn" (click)="clicked.emit()">
      Cancelar
    </button>
  `,
})
export class CancelBookingButton {
  @Output() clicked = new EventEmitter<void>();
}
