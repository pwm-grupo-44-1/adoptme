import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data';
import { StoryItem } from '../../models/data';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stories.html',
  styleUrl: './stories.css'
})
export class Stories implements OnInit {
  stories: StoryItem[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getStories().subscribe({
      next: (data) => this.stories = data,
      error: (err) => console.error('Error cargando historias', err)
    });
  }
}
