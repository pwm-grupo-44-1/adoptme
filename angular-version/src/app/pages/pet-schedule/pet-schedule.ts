//TODO: no se puede reservar mas de 2 citas por dia.

//TODO: Hay que hacer un panel de administracion para el usuario "admin" con una pestana para gestionar las citas de los usuarios registrados y cuando confirme citas, que se envie un correo electronico al usuario.

//TODO: En el panel de administracion debe haber tambien una pestana con un panel para configurar el horario de visitas. Por ejemplo, las visitas a mascotas solo podran ser de lunes a viernes de 10h a 18h, sabados de 9h a 13h y domingo no hay citas disponibles.

//TODO:permitir citas solo hasta dentro de 1 mes por adelantado.

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Animal } from '../../models/animal';
import { AppointmentBooking } from '../../models/booking';
import { DataService } from '../../services/data';
import { LocalJsonService } from '../../services/local-json';
import { AvailableSlots } from '../../shared/available-slots/available-slots';
import { MonthCalendar } from '../../shared/month-calendar/month-calendar';
import { ScheduleFormField } from '../../shared/schedule-form-field/schedule-form-field';
import { UpcomingBookings } from '../../shared/upcoming-bookings/upcoming-bookings';
import {
  BookingFormModel,
  CalendarDay,
  SlotState,
  UpcomingBookingView,
} from './pet-schedule.models';

@Component({
  selector: 'app-pet-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, MonthCalendar, AvailableSlots, ScheduleFormField, UpcomingBookings],
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

  scheduleSlots: string[] = [];
  animals: Animal[] = [];
  bookings: AppointmentBooking[] = [];

  visibleMonth = this.startOfMonth(new Date());
  selectedDate = '';
  selectedSlot = '';
  isLoading = true;
  isBookingJustConfirmed = false;
  showSlotValidationError = false;
  fieldTouched = {
    contactName: false,
    email: false,
    phone: false,
  };

  statusTone: 'success' | 'error' | 'info' = 'info';
  statusMessage = '';

  private bookingConfirmationTimeoutId: ReturnType<typeof setTimeout> | null = null;

  bookingForm: BookingFormModel = {
    contactName: '',
    email: '',
    phone: '',
    animalId: null,
    notes: '',
  };

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private localJsonService: LocalJsonService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.bookings = this.sortBookings(this.localJsonService.getBookings());

    this.dataService.mascotas$.subscribe((animals) => {
      this.animals = [...animals].sort((left, right) => left.name.localeCompare(right.name));
      this.applySelectedAnimalFromRoute();
    });

    this.route.queryParamMap.subscribe(() => {
      this.applySelectedAnimalFromRoute();
    });

    this.dataService.getSchedule().subscribe({
      next: (scheduleData) => {
        const fallbackSlots = this.buildHourlySlots(9, 18);
        this.scheduleSlots = this.sortSlots([
          ...fallbackSlots,
          ...(scheduleData?.slots ?? []),
        ]);
        this.isLoading = false;
        this.ensureSelectedDate();
      },
      error: () => {
        this.scheduleSlots = this.buildHourlySlots(9, 18);
        this.isLoading = false;
        this.setStatus('error', 'No se pudo cargar la agenda. Se muestran los horarios por defecto.');
        this.ensureSelectedDate();
      },
    });
  }

  get monthTitle(): string {
    return this.visibleMonth.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
  }

  get canGoToPreviousMonth(): boolean {
    const today = this.startOfMonth(new Date());
    return this.visibleMonth > today;
  }

  get calendarDays(): CalendarDay[] {
    const year = this.visibleMonth.getFullYear();
    const month = this.visibleMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekDayOffset = this.getMonthFirstWeekDayOffset(year, month);

    const leadingPlaceholders: CalendarDay[] = Array.from({ length: firstWeekDayOffset }, () => ({
      dayNumber: null,
      isoDate: '',
      isSelected: false,
      isToday: false,
      isDisabled: true,
      freeSlots: 0,
      isPlaceholder: true,
    }));

    const monthDays: CalendarDay[] = Array.from({ length: daysInMonth }, (_, index) => {
      const dayNumber = index + 1;
      const isoDate = this.toIsoDate(new Date(year, month, dayNumber));
      const freeSlots = this.getFreeSlotCount(isoDate);

      return {
        dayNumber,
        isoDate,
        isSelected: this.selectedDate === isoDate,
        isToday: isoDate === this.todayIso(),
        isDisabled: freeSlots === 0,
        freeSlots,
        isPlaceholder: false,
      };
    });

    return [...leadingPlaceholders, ...monthDays];
  }

  get selectedDateLabel(): string {
    if (!this.selectedDate) {
      return 'Selecciona un dia del calendario';
    }

    return this.formatDate(this.selectedDate);
  }

  get selectedAnimal(): Animal | null {
    if (!this.bookingForm.animalId) {
      return null;
    }

    return this.animals.find((animal) => animal.id === this.bookingForm.animalId) ?? null;
  }

  get selectedDaySlots(): SlotState[] {
    if (!this.selectedDate) {
      return [];
    }

    return this.getAllowedSlotsForDate(this.selectedDate).map((time) => ({
      time,
      isBooked: this.isSlotBooked(this.selectedDate, time),
      isExpired: this.isSlotExpired(this.selectedDate, time),
    }));
  }

  get upcomingBookings(): AppointmentBooking[] {
    const now = new Date();

    return this.bookings.filter((booking) => {
      const bookingDate = this.combineDateAndSlot(booking.date, booking.slot);
      return bookingDate >= now;
    });
  }

  get upcomingBookingViews(): UpcomingBookingView[] {
    return this.upcomingBookings.map((booking) => ({
      id: booking.id,
      dateLabel: this.formatDate(booking.date),
      metaLabel: `${booking.slot}h · ${this.animalName(booking.animalId)}`,
      contactLabel: `${booking.contactName} \n ${booking.email}`,
    }));
  }

  get isContactNameInvalid(): boolean {
    const value = this.bookingForm.contactName.trim();
    return !value || !new RegExp(this.contactNamePattern).test(value);
  }

  get isEmailInvalid(): boolean {
    const value = this.bookingForm.email.trim();
    return !value || !new RegExp(this.emailPattern).test(value);
  }

  get isPhoneInvalid(): boolean {
    const value = this.bookingForm.phone.trim();
    return !value || !new RegExp(this.phonePattern).test(value);
  }

  changeMonth(step: number): void {
    const target = new Date(
      this.visibleMonth.getFullYear(),
      this.visibleMonth.getMonth() + step,
      1
    );

    if (step < 0 && !this.canGoToPreviousMonth) {
      return;
    }

    this.visibleMonth = target;

    if (!this.selectedDate.startsWith(this.monthPrefix(target))) {
      this.selectedDate = '';
      this.selectedSlot = '';
      this.ensureSelectedDate();
    }
  }

  selectDate(isoDate: string): void {
    if (this.getFreeSlotCount(isoDate) === 0) {
      return;
    }

    this.selectedDate = isoDate;

    if (this.selectedSlot && !this.isSlotSelectable(isoDate, this.selectedSlot)) {
      this.selectedSlot = '';
    }

    this.showSlotValidationError = false;
    this.clearStatus();
  }

  selectSlot(slot: SlotState): void {
    if (slot.isBooked || slot.isExpired || !this.selectedDate) {
      return;
    }

    this.selectedSlot = slot.time;
    this.showSlotValidationError = false;
    this.clearStatus();
  }

  markFieldAsTouched(field: 'contactName' | 'email' | 'phone'): void {
    this.fieldTouched[field] = true;
  }

  confirmBooking(form: NgForm): void {
    if (!this.selectedDate) {
      this.setStatus('error', 'Selecciona primero un dia disponible.');
      this.scrollToPageStart();
      return;
    }

    if (!this.selectedSlot) {
      this.showSlotValidation(this.slotValidationMessage);
      return;
    }

    if (form.invalid) {
      this.setStatus('error', this.getBookingFormError(form));
      // this.scrollToPageStart();
      return;
    }

    if (!this.isSlotSelectable(this.selectedDate, this.selectedSlot)) {
      this.selectedSlot = '';
      this.showSlotValidation('Ese hueco ya no esta disponible. Elige otro horario.');
      return;
    }

    const booking: AppointmentBooking = {
      id: this.buildBookingId(),
      date: this.selectedDate,
      slot: this.selectedSlot,
      animalId: this.bookingForm.animalId,
      contactName: this.bookingForm.contactName.trim(),
      email: this.bookingForm.email.trim(),
      phone: this.bookingForm.phone.trim(),
      notes: this.bookingForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    this.bookings = this.sortBookings([...this.bookings, booking]);
    this.persistBookings();

    this.triggerBookingSuccessFeedback();
    this.setStatus('success', this.bookingSuccessMessage);

    this.selectedSlot = '';
    this.showSlotValidationError = false;
    this.ensureSelectedDate();

    form.resetForm({
      contactName: '',
      email: '',
      phone: '',
      animalId: this.bookingForm.animalId,
      notes: '',
    });

    this.bookingForm = {
      ...this.bookingForm,
      contactName: '',
      email: '',
      phone: '',
      notes: '',
    };
    this.fieldTouched = {
      contactName: false,
      email: false,
      phone: false,
    };
  }

  cancelBooking(bookingId: string): void {
    const booking = this.bookings.find((item) => item.id === bookingId);
    if (!booking) {
      return;
    }

    this.bookings = this.bookings.filter((item) => item.id !== bookingId);
    this.persistBookings();

    if (!this.selectedDate) {
      this.selectedDate = booking.date;
    }

    this.setStatus(
      'info',
      `Se ha cancelado la cita del ${this.formatDate(booking.date)} a las ${booking.slot}h.`
    );

    if (!this.selectedDate.startsWith(this.monthPrefix(this.visibleMonth))) {
      this.visibleMonth = this.startOfMonth(this.parseIsoDate(this.selectedDate));
    }

    this.ensureSelectedDate();
  }

  animalName(animalId: number | null): string {
    if (!animalId) {
      return 'Visita general';
    }

    return this.animals.find((animal) => animal.id === animalId)?.name ?? 'Mascota';
  }

  private applySelectedAnimalFromRoute(): void {
    const rawId = this.route.snapshot.queryParamMap.get('id');
    const animalId = rawId ? Number(rawId) : NaN;

    if (!Number.isFinite(animalId)) {
      return;
    }

    const animalExists = this.animals.some((animal) => animal.id === animalId);
    if (animalExists) {
      this.bookingForm.animalId = animalId;
    }
  }

  private ensureSelectedDate(): void {
    if (this.selectedDate && this.getFreeSlotCount(this.selectedDate) > 0) {
      return;
    }

    const firstAvailable = this.findFirstAvailableDateInMonth(this.visibleMonth);
    this.selectedDate = firstAvailable;

    if (!this.isSlotSelectable(this.selectedDate, this.selectedSlot)) {
      this.selectedSlot = '';
    }
  }

  private findFirstAvailableDateInMonth(referenceMonth: Date): string {
    const year = referenceMonth.getFullYear();
    const month = referenceMonth.getMonth();
    const today = new Date();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = new Date(year, month, day);

      if (currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        continue;
      }

      const isoDate = this.toIsoDate(currentDate);
      if (this.getFreeSlotCount(isoDate) > 0) {
        return isoDate;
      }
    }

    return '';
  }

  private getFreeSlotCount(isoDate: string): number {
    if (!isoDate) {
      return 0;
    }

    return this.getAllowedSlotsForDate(isoDate).filter((slot) => this.isSlotSelectable(isoDate, slot)).length;
  }

  private isSlotSelectable(isoDate: string, slot: string): boolean {
    return (
      Boolean(isoDate) &&
      this.getAllowedSlotsForDate(isoDate).includes(slot) &&
      !this.hasReachedDailyBookingLimit(isoDate) &&
      !this.isSlotBooked(isoDate, slot) &&
      !this.isSlotExpired(isoDate, slot)
    );
  }

  private hasReachedDailyBookingLimit(isoDate: string): boolean {
    return this.bookings.filter((booking) => booking.date === isoDate).length >= 2;
  }

  private isSlotBooked(isoDate: string, slot: string): boolean {
    return this.bookings.some((booking) => booking.date === isoDate && booking.slot === slot);
  }

  private isSlotExpired(isoDate: string, slot: string): boolean {
    if (!isoDate) {
      return true;
    }

    return this.combineDateAndSlot(isoDate, slot) <= new Date();
  }

  private combineDateAndSlot(isoDate: string, slot: string): Date {
    const [year, month, day] = isoDate.split('-').map(Number);
    const [hours, minutes] = slot.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  private persistBookings(): void {
    this.localJsonService.saveBookings(this.bookings);
  }

  private showSlotValidation(message: string): void {
    this.showSlotValidationError = true;
    this.setStatus('error', message);
    this.changeDetectorRef.detectChanges();
    this.scrollToPageStart();
  }

  private scrollToPageStart(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  private setStatus(tone: 'success' | 'error' | 'info', message: string): void {
    this.statusTone = tone;
    this.statusMessage = message;
  }

  private clearStatus(): void {
    this.statusMessage = '';
  }

  private triggerBookingSuccessFeedback(): void {
    this.isBookingJustConfirmed = true;

    if (this.bookingConfirmationTimeoutId) {
      clearTimeout(this.bookingConfirmationTimeoutId);
    }

    this.bookingConfirmationTimeoutId = setTimeout(() => {
      this.isBookingJustConfirmed = false;
      this.bookingConfirmationTimeoutId = null;
    }, 1000);
  }

  private sortBookings(bookings: AppointmentBooking[]): AppointmentBooking[] {
    return [...bookings].sort((left, right) => {
      const leftKey = `${left.date}T${left.slot}`;
      const rightKey = `${right.date}T${right.slot}`;
      return leftKey.localeCompare(rightKey);
    });
  }

  private buildBookingId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  private getAllowedSlotsForDate(isoDate: string): string[] {
    if (!isoDate) {
      return [];
    }

    const dayOfWeek = this.parseIsoDate(isoDate).getDay();

    if (dayOfWeek === 0) {
      return [];
    }

    const allowedSlots = dayOfWeek === 6 ? this.saturdayScheduleSlots : this.weekdayScheduleSlots;
    return allowedSlots.filter((slot) => this.scheduleSlots.includes(slot));
  }

  private buildHourlySlots(startHour: number, endHour: number): string[] {
    return Array.from({ length: endHour - startHour + 1 }, (_, index) =>
      `${String(startHour + index).padStart(2, '0')}:00`
    );
  }

  private sortSlots(slots: string[]): string[] {
    return [...new Set(slots)].sort((left, right) => left.localeCompare(right));
  }

  private getBookingFormError(form: NgForm): string {
    const contactNameErrors = form.controls['contactName']?.errors;
    if (contactNameErrors?.['required']) {
      return 'Introduce el nombre completo para reservar la cita.';
    }

    if (contactNameErrors?.['pattern']) {
      return 'Introduce un nombre y apellidos validos.';
    }

    const emailErrors = form.controls['email']?.errors;
    if (emailErrors?.['required']) {
      return 'Introduce un correo electronico de contacto.';
    }

    if (emailErrors?.['email'] || emailErrors?.['pattern']) {
      return 'Introduce un correo electronico valido.';
    }

    const phoneErrors = form.controls['phone']?.errors;
    if (phoneErrors?.['required']) {
      return 'Introduce un telefono de contacto.';
    }

    if (phoneErrors?.['pattern']) {
      return 'Introduce un telefono valido.';
    }

    return 'Completa los datos obligatorios para reservar.';
  }

  formatDate(isoDate: string): string {
    return this.parseIsoDate(isoDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private parseIsoDate(isoDate: string): Date {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private getMonthFirstWeekDayOffset(year: number, month: number): number {
    const firstDay = new Date(year, month, 1).getDay();
    return (firstDay + 6) % 7;
  }

  private todayIso(): string {
    return this.toIsoDate(new Date());
  }

  private monthPrefix(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
