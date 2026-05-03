import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ChangeDetectorRef, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';
import { DataService } from '../../services/data';
import { AuthService } from '../../services/auth';
import { SocialLink } from '../../models/data';
import { AppointmentBooking } from '../../models/booking';
import { Animal } from '../../models/animal';
import { User } from '../../models/user';

interface NavLinkExtended {
  name: string;
  url: string;
  mobileOnly?: boolean;
}

interface UserDraft {
  name: string;
  email: string;
  phone: string;
  type: 'admin' | 'user';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  menuOpen = false;
  brandTitle = '';
  logoUrl = '';
  isLoggedIn = computed(() => !!this.authService.currentUser());
  isAdmin = computed(() => this.authService.currentUser()?.type === 'admin');
  adminMenuOpen = false;
  showBookingsModal = false;
  isAdminBookingsLoading = false;
  showClientsModal = false;
  isAdminUsersLoading = false;
  showSlotConflictModal = false;
  bookings: AppointmentBooking[] = [];
  animals: Animal[] = [];
  users: User[] = [];
  userDrafts: Record<string, UserDraft> = {};

  navLinks: NavLinkExtended[] = [];
  socialLinks: SocialLink[] = [];

  // Inyectamos el ChangeDetectorRef
  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataService.getHeaderData().subscribe(data => {
      this.brandTitle = data.title;
      this.logoUrl = data.logo;
      this.socialLinks = data.socialLinks;

      const mainLinks: NavLinkExtended[] = data.navLinks.map(link => ({ ...link }));

      this.dataService.getFooterData().subscribe(footerData => {
        const mainUrls = new Set(mainLinks.map(link => link.url));
        const mobileLinks: NavLinkExtended[] = footerData.navLinks
          .filter(link => !mainUrls.has(link.url))
          .map(link => ({
            ...link,
            mobileOnly: true
          }));

        this.navLinks = [...mainLinks, ...mobileLinks];

        // 🚀 Despertamos a Angular para que pinte la barra superior ya
        this.cdr.detectChanges();
      });
    });

    this.dataService.mascotas$.subscribe((animals) => {
      this.animals = animals;
    });

    this.dataService.getUsers().subscribe((users) => {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        return;
      }

      const refreshedUser = users.find((user) =>
        user.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
      );

      if (refreshedUser?.banned) {
        this.logout();
        return;
      }

      if (refreshedUser) {
        this.authService.login(refreshedUser);
      }
    });
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void { this.menuOpen = false; }

  get pendingBookings(): AppointmentBooking[] {
    return this.bookings
      .filter((booking) => !booking.status || booking.status === 'pending')
      .sort((left, right) => `${left.date}T${left.slot}`.localeCompare(`${right.date}T${right.slot}`));
  }

  toggleAdminMenu(): void {
    this.adminMenuOpen = !this.adminMenuOpen;
  }

  openBookingsModal(): void {
    this.adminMenuOpen = false;
    this.closeMenu();
    this.showBookingsModal = true;
    this.loadBookings();
  }

  closeBookingsModal(): void {
    this.showBookingsModal = false;
  }

  openClientsModal(): void {
    this.adminMenuOpen = false;
    this.closeMenu();
    this.showClientsModal = true;
    this.loadUsers();
  }

  closeClientsModal(): void {
    this.showClientsModal = false;
  }

  closeSlotConflictModal(): void {
    this.showSlotConflictModal = false;
  }

  goToPetManagement(): void {
    this.adminMenuOpen = false;
    this.closeMenu();
    this.router.navigate(['/adoption-list']);
  }

  confirmBooking(booking: AppointmentBooking): void {
    const slotAlreadyConfirmed = this.bookings.some((item) =>
      item.id !== booking.id &&
      item.date === booking.date &&
      item.slot === booking.slot &&
      item.status === 'confirmed'
    );

    if (slotAlreadyConfirmed) {
      this.showSlotConflictModal = true;
      return;
    }

    const confirmedAt = new Date().toISOString();

    this.bookings = this.bookings.map((item) =>
      item.id === booking.id
        ? { ...item, status: 'confirmed', confirmedAt }
        : item
    );
    this.dataService.updateBooking(booking.id, {
      status: 'confirmed',
      confirmedAt,
    }).catch((err) => console.error('Error al confirmar la cita en Firestore:', err));
    this.openConfirmationEmail(booking);
  }

  rejectBooking(booking: AppointmentBooking): void {
    const rejectedAt = new Date().toISOString();

    this.bookings = this.bookings.map((item) =>
      item.id === booking.id
        ? { ...item, status: 'rejected', rejectedAt }
        : item
    );
    this.dataService.updateBooking(booking.id, {
      status: 'rejected',
      rejectedAt,
    })
      .catch((err) => console.error('Error al rechazar la cita en Firestore:', err));
    this.openRejectionEmail(booking);
  }

  saveUser(user: User): void {
    if (!user.id) {
      return;
    }

    const draft = this.userDrafts[user.id];
    if (!draft) {
      return;
    }

    const updates: Partial<User> = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      type: draft.type,
    };

    this.users = this.users.map((item) =>
      item.id === user.id
        ? { ...item, ...updates }
        : item
    );

    this.dataService.updateUser(user.id, updates)
      .catch((err) => console.error('Error actualizando el usuario en Firestore:', err));
  }

  toggleUserBan(user: User): void {
    if (!user.id) {
      return;
    }

    const banned = !user.banned;
    const updates: Partial<User> = banned
      ? { banned: true, bannedAt: new Date().toISOString() }
      : { banned: false, bannedAt: '' };

    this.users = this.users.map((item) =>
      item.id === user.id
        ? { ...item, ...updates }
        : item
    );

    this.dataService.updateUser(user.id, updates)
      .catch((err) => console.error('Error actualizando el baneo del usuario en Firestore:', err));
  }

  logout(): void {
    this.authService.logout();
    this.adminMenuOpen = false;
    this.closeMenu();
    this.router.navigate(['/']);
  }

  animalName(animalId: number | null): string {
    if (!animalId) {
      return 'Visita general';
    }

    return this.animals.find((animal) => animal.id === animalId)?.name ?? 'Mascota';
  }

  formatBookingDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private loadBookings(): void {
    this.isAdminBookingsLoading = true;
    this.cdr.detectChanges();

    this.dataService.getBookings().pipe(take(1)).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.isAdminBookingsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando las citas pendientes:', err);
        this.isAdminBookingsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadUsers(): void {
    this.isAdminUsersLoading = true;
    this.cdr.detectChanges();

    this.dataService.getUsers().pipe(take(1)).subscribe({
      next: (users) => {
        this.users = [...users].sort((left, right) => left.email.localeCompare(right.email));
        this.userDrafts = this.users.reduce<Record<string, UserDraft>>((drafts, user) => {
          if (!user.id) {
            return drafts;
          }

          drafts[user.id] = {
            name: user.name ?? '',
            email: user.email ?? '',
            phone: user.phone ?? '',
            type: user.type ?? 'user',
          };
          return drafts;
        }, {});
        this.isAdminUsersLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando usuarios registrados:', err);
        this.isAdminUsersLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private openConfirmationEmail(booking: AppointmentBooking): void {
    const animalName = this.animalName(booking.animalId);
    const subject = `Confirmacion de cita AdoptMe - ${this.formatBookingDate(booking.date)}`;
    const body = [
      `Hola ${booking.contactName},`,
      '',
      `Te confirmamos tu cita para el ${this.formatBookingDate(booking.date)} a las ${booking.slot}h.`,
      `Mascota/s solicitadas: ${animalName}.`,
      '',
      'Gracias por confiar en AdoptMe.',
    ].join('\n');

    this.openGmailCompose(booking.email, subject, body);
  }

  private openRejectionEmail(booking: AppointmentBooking): void {
    const animalName = this.animalName(booking.animalId);
    const subject = `Cita AdoptMe no disponible - ${this.formatBookingDate(booking.date)}`;
    const body = [
      `Hola ${booking.contactName},`,
      '',
      `No podemos confirmar tu cita para el ${this.formatBookingDate(booking.date)} a las ${booking.slot}h.`,
      `Mascota/s solicitadas: ${animalName}.`,
      '',
      'Puedes solicitar otra cita desde la web de AdoptMe.',
      '',
      'Gracias por confiar en AdoptMe.',
    ].join('\n');

    this.openGmailCompose(booking.email, subject, body);
  }

  private openGmailCompose(to: string, subject: string, body: string): void {
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to,
      su: subject,
      body,
    });

    window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank', 'noopener,noreferrer');
  }

  @HostListener('window:resize')
  onResize(): void { if (window.innerWidth > 700) this.closeMenu(); }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showSlotConflictModal) {
      this.closeSlotConflictModal();
      return;
    }

    this.closeMenu();
  }
}
