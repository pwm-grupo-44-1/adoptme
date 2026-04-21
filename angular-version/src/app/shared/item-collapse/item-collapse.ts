import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-collapse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-collapse.html',
  styleUrls: ['./item-collapse.css']
})
export class ItemCollapse {
  // Input moderno basado en Signals. Recibe el texto de la cabecera.
  title = input.required<string>();

  // Estado interno para saber si está abierto o cerrado
  isOpen = signal(false);

  toggle() {
    this.isOpen.update(v => !v);
  }
}
