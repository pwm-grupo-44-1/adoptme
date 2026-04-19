import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';
import { LegalItem } from '../../models/data';
import { ItemCollapse } from '../../shared/item-collapse/item-collapse';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, ItemCollapse],
  templateUrl: './legal.html',
  styleUrls: ['./legal.css']
})
export class Legal implements OnInit {
  private dataService = inject(DataService);

  legals = signal<LegalItem[]>([]);

  ngOnInit(): void {
    this.dataService.getLegal().subscribe({
      next: (data) => this.legals.set(data),
      error: (err) => console.error('Error al cargar legales:', err)
    });
  }
}
