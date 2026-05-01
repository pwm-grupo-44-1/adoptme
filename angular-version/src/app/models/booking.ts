export interface AppointmentBooking {
  id: string;
  date: string;
  slot: string;
  animalId: number | null;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
  status?: 'pending' | 'confirmed';
  confirmedAt?: string;
}
