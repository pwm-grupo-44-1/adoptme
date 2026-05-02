//TODO: al reservar cita, no se debe solicitar los datos del usuario, puesto que ya están en la base de datos. Si acaso, 

//TODO: no se puede reservar mas de 2 citas por dia.

//TODO: Hay que hacer un panel de administracion para el usuario "admin" con una pestana para gestionar las citas de los usuarios registrados y cuando confirme citas, que se envie un correo electronico al usuario.

//TODO: En el panel de administracion debe haber tambien una pestana con un panel para configurar el horario de visitas. Por ejemplo, las visitas a mascotas solo podran ser de lunes a viernes de 10h a 18h, sabados de 9h a 13h y domingo no hay citas disponibles.

//TODO:permitir citas solo hasta dentro de 1 mes por adelantado.

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Animal } from '../../models/animal';
import { AppointmentBooking } from '../../models/booking';
import { AuthService } from '../../services/auth';
import { DataService } from '../../services/data'; // Ajustado al nombre real de tu servicio
import { AvailableSlots } from '../../shared/available-slots/available-slots';
import { MonthCalendar } from '../../shared/month-calendar/month-calendar';
import { UpcomingBookings } from '../../shared/upcoming-bookings/upcoming-bookings';
import { BookingFormModel, CalendarDay, SlotState, UpcomingBookingView, } from './pet-schedule.models';

@Component({
  selector: 'app-pet-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MonthCalendar, AvailableSlots, UpcomingBookings],
  templateUrl: './pet-schedule.html',
  styleUrl: './pet-schedule.css',
  encapsulation: ViewEncapsulation.None,
})
export class PetSchedule implements OnInit {
  readonly weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  readonly bookingSuccessMessage = 'Su cita sera confirmada por correo electronico.';
  readonly slotValidationMessage = 'Debes elegir una hora disponible';
  readonly weekdayScheduleSlots = this.buildHourlySlots(10, 18);
  readonly saturdayScheduleSlots = this.buildHourlySlots(9, 13);

  animals: Animal[] = [];
  bookings: AppointmentBooking[] = [];

  visibleMonth = this.startOfMonth(new Date());
  selectedDate = '';
  selectedSlot = '';
  isLoading = true;
  isBookingJustConfirmed = false;
  showSlotValidationError = false;
  statusTone: 'success' | 'error' | 'info' = 'info';
  statusMessage = '';

  private bookingConfirmationTimeoutId: ReturnType<typeof setTimeout> | null = null;

  bookingForm: BookingFormModel = {
    animalId: null,
    notes: '',
  };

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  get canAccessSchedule(): boolean {
    const user = this.authService.currentUser();
    return user?.type === 'admin' || user?.type === 'user';
  }

  get isAdmin(): boolean {
    return this.authService.currentUser()?.type === 'admin';
  }

  ngOnInit(): void {
    this.dataService.getBookings().subscribe((bookings) => {
      this.bookings = this.sortBookings(bookings);
      this.isLoading = false;
      this.ensureSelectedDate();
      this.changeDetectorRef.detectChanges();
    }, (err) => {
      console.error('Error cargando las citas:', err);
      this.isLoading = false;
      this.setStatus('error', `No se pudieron cargar las citas: ${err?.code ?? err?.message ?? 'error desconocido'}.`);
      this.ensureSelectedDate();
      this.changeDetectorRef.detectChanges();
    });

    this.dataService.mascotas$.subscribe((animals) => {
      this.animals = [...animals].sort((left, right) => left.name.localeCompare(right.name));
      this.applySelectedAnimalFromRoute();
      // 🚀 MAGIA: Obligamos a repintar si los datos llegan de golpe tras un F5
      this.changeDetectorRef.detectChanges();
    });

    this.route.queryParamMap.subscribe(() => {
      this.applySelectedAnimalFromRoute();
      this.changeDetectorRef.detectChanges();
    });

    /*
        // 🚀 CORRECCIÓN DEL BUG: Quitamos la 'h' del db.json ("10:00h" -> "10:00")

        // 🚀 MAGIA: Repintamos para que desaparezca el "Cargando agenda..."
    */
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
    const currentUser = this.authService.currentUser();

    return this.bookings.filter((booking) => {
      const bookingDate = this.combineDateAndSlot(booking.date, booking.slot);
      const belongsToCurrentUser =
        currentUser?.type === 'admin' ||
        booking.email.trim().toLowerCase() === currentUser?.email.trim().toLowerCase();

      return bookingDate >= now && belongsToCurrentUser;
    });
  }

  get upcomingBookingViews(): UpcomingBookingView[] {
    return this.upcomingBookings.map((booking) => {
      const statusTone = this.getBookingStatusTone(booking);

      return {
        id: booking.id,
        dateLabel: this.formatDate(booking.date),
        metaLabel: `${booking.slot}h · ${this.animalName(booking.animalId)}`,
        contactLabel: `${booking.contactName} \n ${booking.email}`,
        statusLabel: this.getBookingStatusLabel(statusTone),
        statusTone,
      };
    });
  }

  get isContactNameInvalid(): boolean {
    return false;
  }

  get isEmailInvalid(): boolean {
    return false;
  }

  get isPhoneInvalid(): boolean {
    return false;
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

    this.changeDetectorRef.detectChanges();
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
    this.changeDetectorRef.detectChanges();
  }

  selectSlot(slot: SlotState): void {
    if (slot.isBooked || slot.isExpired || !this.selectedDate) {
      return;
    }

    this.selectedSlot = slot.time;
    this.showSlotValidationError = false;
    this.clearStatus();
    this.changeDetectorRef.detectChanges();
  }

  confirmBooking(form: NgForm): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      this.setStatus('error', 'Debes iniciar sesion para reservar una cita.');
      this.scrollToPageStart();
      return;
    }

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
      contactName: currentUser.name.trim(),
      email: currentUser.email.trim(),
      notes: this.bookingForm.notes.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    this.bookings = this.sortBookings([...this.bookings, booking]);
    this.dataService.addBooking(booking).catch((err) => {
      console.error('Error al guardar la cita en Firestore:', err);
      this.bookings = this.bookings.filter((item) => item.id !== booking.id);
      this.setStatus('error', 'No se pudo guardar la cita. Intentalo de nuevo.');
      this.changeDetectorRef.detectChanges();
    });

    this.triggerBookingSuccessFeedback();
    this.setStatus('success', this.bookingSuccessMessage);

    this.selectedSlot = '';
    this.showSlotValidationError = false;
    this.ensureSelectedDate();

    form.resetForm({
      animalId: this.bookingForm.animalId,
      notes: '',
    });

    this.bookingForm = {
      ...this.bookingForm,
      notes: '',
    };
  }

  cancelBooking(bookingId: string): void {
    const booking = this.bookings.find((item) => item.id === bookingId);
    if (!booking) {
      return;
    }

    this.bookings = this.bookings.filter((item) => item.id !== bookingId);
    this.dataService.deleteBooking(bookingId).catch((err) => {
      console.error('Error al cancelar la cita en Firestore:', err);
      this.setStatus('error', 'No se pudo cancelar la cita.');
      this.changeDetectorRef.detectChanges();
    });

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

  private getBookingStatusTone(booking: AppointmentBooking): 'confirmed' | 'rejected' | 'pending' {
    if (booking.status === 'confirmed') {
      return 'confirmed';
    }

    if (booking.status === 'rejected') {
      return 'rejected';
    }

    return 'pending';
  }

  private getBookingStatusLabel(statusTone: 'confirmed' | 'rejected' | 'pending'): string {
    if (statusTone === 'confirmed') {
      return 'Confirmada';
    }

    if (statusTone === 'rejected') {
      return 'Rechazada';
    }

    return 'Pendiente de confirmar';
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

    this.selectedDate = this.findFirstAvailableDateInMonth(this.visibleMonth);

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
      !this.isSlotBooked(isoDate, slot) &&
      !this.isSlotExpired(isoDate, slot)
    );
  }

  private isSlotBooked(isoDate: string, slot: string): boolean {
    return this.bookings.some((booking) =>
      booking.date === isoDate &&
      booking.slot === slot &&
      booking.status === 'confirmed'
    );
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
      // 🚀 MAGIA: Repintar cuando desaparece el feedback de éxito
      this.changeDetectorRef.detectChanges();
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

  private getDefaultSlotsForDate(date: Date): string[] {
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) {
      return [];
    }

    return dayOfWeek === 6 ? this.saturdayScheduleSlots : this.weekdayScheduleSlots;
  }

  private getAllowedSlotsForDate(isoDate: string): string[] {
    if (!isoDate) {
      return [];
    }

    const date = this.parseIsoDate(isoDate);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) {
      return [];
    }

    return this.getDefaultSlotsForDate(date);
  }

  private buildHourlySlots(startHour: number, endHour: number): string[] {
    return Array.from({ length: endHour - startHour + 1 }, (_, index) =>
      `${String(startHour + index).padStart(2, '0')}:00`
    );
  }

  private getBookingFormError(form: NgForm): string {
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
