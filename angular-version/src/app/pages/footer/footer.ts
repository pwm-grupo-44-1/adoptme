import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data';
import { AuthService } from '../../services/auth';

interface FooterLink {
  name: string;
  url: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent implements OnInit {
  leftLinks: FooterLink[] = [];
  rightLinks: FooterLink[] = [];
  legalText = '';

  private readonly authService = inject(AuthService);
  private readonly scheduleLink = signal<FooterLink | null>(null);
  private readonly favoritesLink: FooterLink = { name: 'Favoritos', url: '/favorites' };

  readonly centerLink = computed(() => {
    const user = this.authService.currentUser();
    if (user && user.type !== 'admin') {
      return this.favoritesLink;
    }
    return false;
  });

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getFooterData().subscribe((data) => {
      this.legalText = data.copyright;

      if (data.navLinks && data.navLinks.length > 0) {
        const scheduleLink = data.navLinks.find((link) => link.url.includes('schedule'));
        this.scheduleLink.set(scheduleLink ?? null);

        const otherLinks = data.navLinks.filter((link) => !link.url.includes('schedule'));
        const half = Math.ceil(otherLinks.length / 2);

        this.leftLinks = otherLinks.slice(0, half);
        this.rightLinks = otherLinks.slice(half);
      }
    });
  }
}
