export interface AppointmentBooking {
  id: string;
  date: string;
  slot: string;
  animalId: number | null;
  contactName: string;
  email: string;
  notes: string;
  createdAt: string;
  status?: 'pending' | 'confirmed' | 'rejected';
  confirmedAt?: string;
  rejectedAt?: string;
}
