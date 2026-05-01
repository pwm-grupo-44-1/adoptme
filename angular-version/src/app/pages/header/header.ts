import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ChangeDetectorRef, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';
import { DataService } from '../../services/data';
import { AuthService } from '../../services/auth';
import { SocialLink } from '../../models/data';
import { AppointmentBooking } from '../../models/booking';
import { Animal } from '../../models/animal';

interface NavLinkExtended {
  name: string;
  url: string;
  mobileOnly?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
  bookings: AppointmentBooking[] = [];
  animals: Animal[] = [];

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
        const mobileLinks: NavLinkExtended[] = footerData.navLinks.map(link => ({
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
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void { this.menuOpen = false; }

  get pendingBookings(): AppointmentBooking[] {
    return this.bookings
      .filter((booking) => booking.status !== 'confirmed')
      .sort((left, right) => `${left.date}T${left.slot}`.localeCompare(`${right.date}T${right.slot}`));
  }

  toggleAdminMenu(): void {
    this.adminMenuOpen = !this.adminMenuOpen;
  }

  openBookingsModal(): void {
    this.loadBookings();
    this.adminMenuOpen = false;
    this.closeMenu();
    this.showBookingsModal = true;
  }

  closeBookingsModal(): void {
    this.showBookingsModal = false;
  }

  goToPetManagement(): void {
    this.adminMenuOpen = false;
    this.closeMenu();
    this.router.navigate(['/adoption-list']);
  }

  confirmBooking(booking: AppointmentBooking): void {
    this.bookings = this.bookings.map((item) =>
      item.id === booking.id
        ? { ...item, status: 'confirmed', confirmedAt: new Date().toISOString() }
        : item
    );
    this.dataService.updateBooking(booking.id, {
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
    }).catch((err) => console.error('Error al confirmar la cita en Firestore:', err));
    this.openConfirmationEmail(booking);
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
    this.dataService.getBookings().pipe(take(1)).subscribe((bookings) => {
      this.bookings = bookings;
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

    window.location.href = `mailto:${booking.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  @HostListener('window:resize')
  onResize(): void { if (window.innerWidth > 700) this.closeMenu(); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeMenu(); }
}
