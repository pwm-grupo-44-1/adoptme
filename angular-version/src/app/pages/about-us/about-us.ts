import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css'
})
export class AboutUs {
  members: TeamMember[] = [
    {
      name: 'Esther',
      role: 'Frontend Developer',
      description: 'Apasionada por crear interfaces claras, accesibles y agradables para que la experiencia de adopción sea sencilla y cercana.',
      image: '/img/about-us/esther.jpg'
    },
    {
      name: 'Alejandro',
      role: 'Backend Developer',
      description: 'Encargado de la lógica y la estructura de la aplicación para que todo funcione de forma estable, rápida y segura.',
      image: '/img/about-us/alejandro.jpg'
    },
    {
      name: 'Néstor',
      role: 'UI/UX Designer',
      description: 'Diseña la experiencia visual y de navegación, buscando que cada persona conecte fácilmente con la plataforma y con los animales.',
      image: '/img/about-us/nestor.jpg'
    }
  ];
}
