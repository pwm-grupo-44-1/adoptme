import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DataService } from '../../services/data'; // Ajusta la ruta si es necesario
import { ContactReason } from '../../models/data';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.css'] // En Angular 17+ puedes usar styleUrl, pero styleUrls es más retrocompatible
})
export class ContactUs implements OnInit {
  private dataService = inject(DataService);
  private sanitizer = inject(DomSanitizer); // 👈 Herramienta de seguridad de Angular

  // Usamos Signals para la reactividad moderna
  title = signal('');
  reasons = signal<ContactReason[]>([]);
  mapUrl = signal<SafeResourceUrl | null>(null); // 👈 El tipo cambia a URL Segura
  contactInfo = signal<string[]>([]);

  ngOnInit(): void {
    this.dataService.getContactUs().subscribe({
      next: (data) => {
        this.title.set(data.title);
        this.reasons.set(data.reasons);
        this.contactInfo.set(data.info);

        // 🚀 SANITIZAMOS LA URL: Le decimos a Angular que confíe en este enlace para el iframe
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.mapUrl);
        this.mapUrl.set(safeUrl);
      },
      error: (err) => console.error('Error cargando contacto:', err)
    });
  }
}
