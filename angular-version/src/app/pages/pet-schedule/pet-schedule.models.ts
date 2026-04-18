export interface CalendarDay {
  dayNumber: number | null;
  isoDate: string;
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
  freeSlots: number;
  isPlaceholder: boolean;
}

export interface SlotState {
  time: string;
  isBooked: boolean;
  isExpired: boolean;
}

export interface BookingFormModel {
  contactName: string;
  email: string;
  phone: string;
  animalId: number | null;
  notes: string;
}

export interface UpcomingBookingView {
  id: string;
  dateLabel: string;
  metaLabel: string;
  contactLabel: string;
}
