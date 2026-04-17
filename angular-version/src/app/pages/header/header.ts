import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data';
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
  menuOpen = false;
  brandTitle = '';
  logoUrl = '';

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

  @HostListener('window:resize')
  onResize(): void { if (window.innerWidth > 700) this.closeMenu(); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeMenu(); }
}
