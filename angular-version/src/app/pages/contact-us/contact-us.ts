import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ContactReason {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css'
})
export class ContactUs {
  title = '¿Necesitas ayuda? Estamos aquí para ti y para ellos.';

  reasons: ContactReason[] = [
    {
      icon: '📍',
      title: 'Ven a conocernos',
      text: 'Puedes visitar nuestras instalaciones y conocer a los animales que buscan hogar.'
    },
    {
      icon: '📞',
      title: 'Resolvemos tus dudas',
      text: 'Te ayudamos con información sobre adopciones, requisitos y cuidados.'
    },
    {
      icon: '🤝',
      title: 'Te acompañamos',
      text: 'Nuestro equipo te acompaña durante todo el proceso para que encuentres a tu compañero ideal.'
    }
  ];

  mapUrl =
    'https://www.google.com/maps?q=Madrid&output=embed';

  contactInfo: string[] = [
    'AdoptMe! - Centro de adopción',
    'Calle Ejemplo 123, Madrid',
    'Teléfono: 600 123 456',
    'Email: contacto@adoptme.es',
    'Horario: Lunes a Viernes de 10:00 a 19:00'
  ];
}
