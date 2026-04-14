import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavLink {
  name: string;
  url: string;
  highlighted?: boolean;
}

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  menuOpen = false;

  // En tu captura se ve texto "AdoptMe!" y no el logo redondo grande.
  // Por eso aquí lo dejamos como marca textual.
  brandTitle = 'AdoptMe!';

  // SOLO los botones que aparecen en tu captura
  navLinks: NavLink[] = [
    { name: 'Inicio', url: '/' },
    { name: 'Nosotros', url: '/about-us' },
    { name: 'Mascotas', url: '/adoption-list' },
    { name: 'Reserva tu cita', url: '/pet-schedule', highlighted: true },
    { name: 'Acceder', url: '/login' }
  ];

  socialLinks: SocialLink[] = [
    { name: 'Instagram', url: 'https://instagram.com', icon: 'bi bi-instagram' },
    { name: 'Twitter', url: 'https://x.com', icon: 'bi bi-twitter-x' },
    { name: 'YouTube', url: 'https://youtube.com', icon: 'bi bi-youtube' },
    { name: 'TikTok', url: 'https://tiktok.com', icon: 'bi bi-tiktok' }
  ];

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }
}
