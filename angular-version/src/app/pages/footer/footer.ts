import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FooterLink {
  name: string;
  url: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent {
  leftLinks: FooterLink[] = [
    { name: 'Legal', url: '/legal' },
    { name: 'Historias', url: '/stories' }
  ];

  centerLink: FooterLink = {
    name: 'Reserva tu cita',
    url: '/pet-schedule'
  };

  rightLinks: FooterLink[] = [
    { name: 'FAQ', url: '/faq' },
    { name: 'Contacto', url: '/contact-us' }
  ];

  legalText = '© AdoptMe! Todos los derechos reservados.';
}
