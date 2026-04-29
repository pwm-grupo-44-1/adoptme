//TODO: al reservar cita, no se debe solicitar los datos del usuario, puesto que ya están en la base de datos. Si acaso,

//TODO: no se puede reservar mas de 2 citas por dia.

//TODO: Hay que hacer un panel de administracion para el usuario "admin" con una pestana para gestionar las citas de los usuarios registrados y cuando confirme citas, que se envie un correo electronico al usuario.

//TODO: En el panel de administracion debe haber tambien una pestana con un panel para configurar el horario de visitas. Por ejemplo, las visitas a mascotas solo podran ser de lunes a viernes de 10h a 18h, sabados de 9h a 13h y domingo no hay citas disponibles.

//TODO:permitir citas solo hasta dentro de 1 mes por adelantado.

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Animal } from '../../models/animal';
import { AppointmentBooking } from '../../models/booking';
import { DataService } from '../../services/data';
import { LocalJsonService } from '../../services/local-json';
import { AuthService } from '../../services/auth'; // Importamos tu servicio
import { AvailableSlots } from '../../shared/available-slots/available-slots';
import { MonthCalendar } from '../../shared/month-calendar/month-calendar';
import { ScheduleFormField } from '../../shared/schedule-form-field/schedule-form-field';
import { UpcomingBookings } from '../../shared/upcoming-bookings/upcoming-bookings';
import { BookingFormModel, CalendarDay, SlotState, UpcomingBookingView } from './pet-schedule.models';

@Component({
  selector: 'app-pet-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MonthCalendar, AvailableSlots, ScheduleFormField, UpcomingBookings],
  templateUrl: './pet-schedule.html',
  styleUrl: './pet-schedule.css',
  encapsulation: ViewEncapsulation.None,
})
export class PetSchedule implements OnInit {
  readonly weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  readonly bookingSuccessMessage = 'Su cita sera confirmada por correo electronico.';
  readonly contactNamePattern = "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[\\s'-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$";
  readonly emailPattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$';
  readonly phonePattern = '^(?:[6789]\\d{8}|\\+34[6789]\\d{8}|\\+(?!34)[1-9]\\d{5,16})$';
  readonly slotValidationMessage = 'Debes elegir una hora disponible';
  readonly weekdayScheduleSlots = this.buildHourlySlots(10, 18);
  readonly saturdayScheduleSlots = this.buildHourlySlots(9, 13);

  private authService = inject(AuthService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private dataService = inject(DataService);
  private localJsonService = inject(LocalJsonService);
  private route = inject(ActivatedRoute);

  scheduleSlots: string[] = [];
  animals: Animal[] = [];
  bookings: AppointmentBooking[] = [];

  visibleMonth = this.startOfMonth(new Date());
  selectedDate = '';
  selectedSlot = '';
  isLoading = true;
  isBookingJustConfirmed = false;
  showSlotValidationError = false;
  fieldTouched = { contactName: false, email: false, phone: false };

  statusTone: 'success' | 'error' | 'info' = 'info';
  statusMessage = '';

  bookingForm: BookingFormModel = {
    contactName: '',
    email: '',
    phone: '',
    animalId: null,
    notes: '',
  };

  // Getters de estado de sesión
  get isLoggedIn(): boolean {
    return !!this.authService.currentUser();
  }

  get isAdmin(): boolean {
    return this.authService.currentUser()?.type === 'admin';
  }

  ngOnInit(): void {
    // Rellenar datos si el usuario ya está logueado y no es admin
    const user = this.authService.currentUser();
    if (user && user.type !== 'admin') {
      this.bookingForm.contactName = user.name || '';
      this.bookingForm.email = user.email || '';
      this.bookingForm.phone = user.phone || '';
    }

    this.bookings = this.sortBookings(this.localJsonService.getBookings());

    this.dataService.mascotas$.subscribe((animals) => {
      this.animals = [...animals].sort((left, right) => left.name.localeCompare(right.name));
      this.applySelectedAnimalFromRoute();
      this.changeDetectorRef.detectChanges();
    });

    this.dataService.getSchedule().subscribe({
      next: (scheduleData) => {
        const dbSlots = (scheduleData?.slots ?? []).map(s => s.replace('h', '').trim());
        this.scheduleSlots = this.sortSlots([...this.buildHourlySlots(9, 18), ...dbSlots]);
        this.isLoading = false;
        this.ensureSelectedDate();
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.scheduleSlots = this.buildHourlySlots(9, 18);
        this.isLoading = false;
        this.ensureSelectedDate();
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // --- El resto de métodos (getters de calendario, selectDate, confirmBooking, etc.) se mantienen igual que en tu archivo original ---
  // (Omitidos aquí para brevedad, pero debes mantenerlos)

  get monthTitle(): string { return this.visibleMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }); }
  get canGoToPreviousMonth(): boolean { return this.visibleMonth > this.startOfMonth(new Date()); }
  get calendarDays(): CalendarDay[] {
    const year = this.visibleMonth.getFullYear();
    const month = this.visibleMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekDayOffset = this.getMonthFirstWeekDayOffset(year, month);
    const leadingPlaceholders: CalendarDay[] = Array.from({ length: firstWeekDayOffset }, () => ({
      dayNumber: null, isoDate: '', isSelected: false, isToday: false, isDisabled: true, freeSlots: 0, isPlaceholder: true,
    }));
    const monthDays: CalendarDay[] = Array.from({ length: daysInMonth }, (_, index) => {
      const dayNumber = index + 1;
      const isoDate = this.toIsoDate(new Date(year, month, dayNumber));
      const freeSlots = this.getFreeSlotCount(isoDate);
      return { dayNumber, isoDate, isSelected: this.selectedDate === isoDate, isToday: isoDate === this.todayIso(), isDisabled: freeSlots === 0, freeSlots, isPlaceholder: false };
    });
    return [...leadingPlaceholders, ...monthDays];
  }
  get selectedDateLabel(): string { return this.selectedDate ? this.formatDate(this.selectedDate) : 'Selecciona un dia del calendario'; }
  get selectedAnimal(): Animal | null { return this.animals.find((a) => a.id === this.bookingForm.animalId) ?? null; }
  get selectedDaySlots(): SlotState[] {
    if (!this.selectedDate) return [];
    return this.getAllowedSlotsForDate(this.selectedDate).map((time) => ({
      time, isBooked: this.isSlotBooked(this.selectedDate, time), isExpired: this.isSlotExpired(this.selectedDate, time),
    }));
  }
  get upcomingBookings(): AppointmentBooking[] {
    const now = new Date();
    return this.bookings.filter((b) => this.combineDateAndSlot(b.date, b.slot) >= now);
  }
  get upcomingBookingViews(): UpcomingBookingView[] {
    return this.upcomingBookings.map((b) => ({
      id: b.id, dateLabel: this.formatDate(b.date), metaLabel: `${b.slot}h · ${this.animalName(b.animalId)}`, contactLabel: `${b.contactName} \n ${b.email}`,
    }));
  }
  get isContactNameInvalid(): boolean { return !this.bookingForm.contactName.trim() || !new RegExp(this.contactNamePattern).test(this.bookingForm.contactName); }
  get isEmailInvalid(): boolean { return !this.bookingForm.email.trim() || !new RegExp(this.emailPattern).test(this.bookingForm.email); }
  get isPhoneInvalid(): boolean { return !this.bookingForm.phone.trim() || !new RegExp(this.phonePattern).test(this.bookingForm.phone); }

  changeMonth(step: number): void {
    this.visibleMonth = new Date(this.visibleMonth.getFullYear(), this.visibleMonth.getMonth() + step, 1);
    this.ensureSelectedDate();
  }
  selectDate(isoDate: string): void { if (this.getFreeSlotCount(isoDate) > 0) { this.selectedDate = isoDate; this.statusMessage = ''; } }
  selectSlot(slot: SlotState): void { if (!slot.isBooked && !slot.isExpired) { this.selectedSlot = slot.time; this.statusMessage = ''; } }
  markFieldAsTouched(field: 'contactName' | 'email' | 'phone'): void { this.fieldTouched[field] = true; }

  confirmBooking(form: NgForm): void {
    if (!this.selectedDate || !this.selectedSlot || form.invalid) {
      this.statusTone = 'error';
      this.statusMessage = 'Por favor, completa todos los datos correctamente.';
      return;
    }
    const booking: AppointmentBooking = {
      id: `${Date.now()}`, date: this.selectedDate, slot: this.selectedSlot, animalId: this.bookingForm.animalId,
      contactName: this.bookingForm.contactName.trim(), email: this.bookingForm.email.trim(), phone: this.bookingForm.phone.trim(),
      notes: this.bookingForm.notes.trim(), createdAt: new Date().toISOString(),
    };
    this.bookings = this.sortBookings([...this.bookings, booking]);
    this.localJsonService.saveBookings(this.bookings);
    this.statusTone = 'success';
    this.statusMessage = this.bookingSuccessMessage;
    this.isBookingJustConfirmed = true;
    setTimeout(() => this.isBookingJustConfirmed = false, 2000);
  }

  cancelBooking(id: string): void {
    this.bookings = this.bookings.filter(b => b.id !== id);
    this.localJsonService.saveBookings(this.bookings);
    this.statusTone = 'info';
    this.statusMessage = 'Cita cancelada correctamente.';
  }

  // Auxiliares privados obligatorios
  private applySelectedAnimalFromRoute() {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));
    if (this.animals.some(a => a.id === id)) this.bookingForm.animalId = id;
  }
  private ensureSelectedDate() { this.selectedDate = this.findFirstAvailableDateInMonth(this.visibleMonth); }
  private findFirstAvailableDateInMonth(ref: Date): string {
    for (let i = 1; i <= 31; i++) {
      const d = new Date(ref.getFullYear(), ref.getMonth(), i);
      if (d.getMonth() !== ref.getMonth()) break;
      const iso = this.toIsoDate(d);
      if (this.getFreeSlotCount(iso) > 0) return iso;
    }
    return '';
  }
  private getFreeSlotCount(iso: string): number { return this.getAllowedSlotsForDate(iso).filter(s => !this.isSlotBooked(iso, s) && !this.isSlotExpired(iso, s)).length; }
  private isSlotBooked(iso: string, s: string): boolean { return this.bookings.some(b => b.date === iso && b.slot === s); }
  private isSlotExpired(iso: string, s: string): boolean { return this.combineDateAndSlot(iso, s) <= new Date(); }
  private combineDateAndSlot(iso: string, s: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    const [h, min] = s.split(':').map(Number);
    return new Date(y, m - 1, d, h, min);
  }
  private getAllowedSlotsForDate(iso: string): string[] {
    const day = this.toIsoDate(this.parseIsoDate(iso)) === iso ? this.parseIsoDate(iso).getDay() : -1;
    if (day === 0) return [];
    const slots = day === 6 ? this.saturdayScheduleSlots : this.weekdayScheduleSlots;
    return slots.filter(s => this.scheduleSlots.includes(s));
  }
  private buildHourlySlots(s: number, e: number): string[] { return Array.from({ length: e - s + 1 }, (_, i) => `${String(s + i).padStart(2, '0')}:00`); }
  private sortSlots(s: string[]): string[] { return [...new Set(s)].sort(); }
  private sortBookings(b: AppointmentBooking[]): AppointmentBooking[] { return [...b].sort((l, r) => `${l.date}T${l.slot}`.localeCompare(`${r.date}T${r.slot}`)); }
  private animalName(id: number | null): string { return this.animals.find(a => a.id === id)?.name ?? 'Visita general'; }
  private parseIsoDate(iso: string): Date { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
  private toIsoDate(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  private todayIso(): string { return this.toIsoDate(new Date()); }
  private startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private getMonthFirstWeekDayOffset(y: number, m: number): number { return (new Date(y, m, 1).getDay() + 6) % 7; }
  formatDate(iso: string): string { return this.parseIsoDate(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
}
