import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data';
import { TeamMember } from '../../models/data';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css'
})
export class AboutUs implements OnInit {
  members: TeamMember[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getAboutUs().subscribe({
      next: (data) => this.members = data,
      error: (err) => console.error('Error cargando equipo', err)
    });
  }
}
