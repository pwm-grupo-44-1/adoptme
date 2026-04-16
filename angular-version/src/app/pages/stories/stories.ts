import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface StoryItem {
  name: string;
  text: string;
  image: string;
}

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stories.html',
  styleUrl: './stories.css'
})
export class Stories {
  stories: StoryItem[] = [
    {
      name: 'Toby',
      text: 'Toby llegó a nosotros asustado y desnutrido. Hoy vive con la familia Rodríguez y es el perro más feliz del barrio.',
      image: '/img/stories/toby.jpg'
    },
    {
      name: 'Luna',
      text: 'Luna fue encontrada en la calle con solo dos semanas de vida. Tras meses de cuidados, encontró su hogar para siempre.',
      image: '/img/stories/luna.jpg'
    },
    {
      name: 'Rocky',
      text: 'Rocky estuvo tres años esperando. Nadie lo elegía por su tamaño. Hoy tiene jardín y dos niños que lo adoran.',
      image: '/img/stories/rocky.jpg'
    },
    {
      name: 'Nala',
      text: 'Nala llegó con miedo a las personas. Con paciencia y amor, se convirtió en la gata más cariñosa que puedas imaginar.',
      image: '/img/stories/nala.jpg'
    }
  ];
}
