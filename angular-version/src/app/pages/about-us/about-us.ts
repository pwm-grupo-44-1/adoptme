import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DataService } from '../../services/data'; // Ajusta la ruta si es necesario
import { TeamMember } from '../../models/data';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.html',
  styleUrls: ['./about-us.css'] // styleUrls en plural
})
export class AboutUs implements OnInit {
  private dataService = inject(DataService);

  // Usamos Signal
  members = signal<TeamMember[]>([]);

  ngOnInit(): void {
    this.dataService.getAboutUs().subscribe({
      next: (data) => this.members.set(data),
      error: (err) => console.error('Error cargando equipo', err)
    });
  }
}
