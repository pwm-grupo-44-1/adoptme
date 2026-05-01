import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ChangeDetectorRef, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data';
import { AuthService } from '../../services/auth';
import { SocialLink } from '../../models/data';

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

  navLinks: NavLinkExtended[] = [];
  socialLinks: SocialLink[] = [];

  // Inyectamos el ChangeDetectorRef
  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

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
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void { this.menuOpen = false; }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }

  @HostListener('window:resize')
  onResize(): void { if (window.innerWidth > 700) this.closeMenu(); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeMenu(); }
}
