import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data';

interface FooterLink { name: string; url: string; }

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent implements OnInit {
  leftLinks: FooterLink[] = [];
  centerLink: FooterLink | null = null;
  rightLinks: FooterLink[] = [];
  legalText = '';

  // Inyectamos el ChangeDetectorRef
  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.dataService.getFooterData().subscribe(data => {
      this.legalText = data.copyright;

      if (data.navLinks && data.navLinks.length > 0) {
        const scheduleLink = data.navLinks.find(l => l.url.includes('schedule'));
        if (scheduleLink) this.centerLink = scheduleLink;

        const otherLinks = data.navLinks.filter(l => !l.url.includes('schedule'));

        const half = Math.ceil(otherLinks.length / 2);
        this.leftLinks = otherLinks.slice(0, half);
        this.rightLinks = otherLinks.slice(half);
      }

      // 🚀 Despertamos a Angular para que pinte el footer
      this.cdr.detectChanges();
    });
  }
}
