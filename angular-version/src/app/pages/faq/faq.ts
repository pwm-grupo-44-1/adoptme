import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';
import { FaqItem } from '../../models/data';
import { ItemCollapse } from '../../shared/item-collapse/item-collapse';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, ItemCollapse],
  templateUrl: './faq.html',
  styleUrls: ['./faq.css']
})
export class Faq implements OnInit {
  private dataService = inject(DataService);

  // Guardamos las preguntas en un Signal reactivo
  faqs = signal<FaqItem[]>([]);

  ngOnInit(): void {
    this.dataService.getFaq().subscribe({
      next: (data) => this.faqs.set(data),
      error: (err) => console.error('Error al cargar FAQ:', err)
    });
  }
}
