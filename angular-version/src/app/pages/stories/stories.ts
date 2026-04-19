import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DataService } from '../../services/data';
import { StoryItem } from '../../models/data';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stories.html',
  styleUrls: ['./stories.css']
})
export class Stories implements OnInit {
  private dataService = inject(DataService);

  // Usamos Signal
  stories = signal<StoryItem[]>([]);

  ngOnInit(): void {
    this.dataService.getStories().subscribe({
      next: (data) => this.stories.set(data),
      error: (err) => console.error('Error cargando historias', err)
    });
  }
}
