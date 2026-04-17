import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';
import { Animal } from '../../models/animal';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter.html',
  styleUrl: './filter.css'
})
export class Filter implements OnInit {
  @Output() filtrosCambiados = new EventEmitter<any>();

  generosSeleccionados = new Set<string>();
  razasSeleccionadas = new Set<string>();
  edadesSeleccionadas = new Set<string>();
  pesosSeleccionados = new Set<string>();
  pelosSeleccionados = new Set<string>();
  caracteresSeleccionados = new Set<string>();
  ordenSeleccionado: string = '';

  razas: string[] = [];
  pelos: string[] = [];
  caracteres: string[] = [];

  edades: string[] = ['Cachorro (0-2 años)', 'Adulto (3-6 años)', 'Senior (7+ años)'];
  pesos: string[] = ['Pequeño (≤5kg)', 'Mediano (6-15kg)', 'Grande (>15kg)'];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.mascotas$.subscribe((mascotas: Animal[]) => {
      this.razas = [...new Set<string>(mascotas.map(m => m.breed))].filter(Boolean);
      this.pelos = [...new Set<string>(mascotas.map(m => m['hair type']))].filter(Boolean);
      this.caracteres = [...new Set<string>(mascotas.map(m => m.mood))].filter(Boolean);
    });
  }

  toggleFiltro(tipo: Set<string>, valor: string) {
    if (tipo.has(valor)) {
      tipo.delete(valor);
    } else {
      tipo.add(valor);
    }
    this.emitirFiltros();
  }

  cambiarOrden(event: any) {
    this.ordenSeleccionado = event.target.value;
    this.emitirFiltros();
  }

  emitirFiltros() {
    this.filtrosCambiados.emit({
      generos: Array.from(this.generosSeleccionados),
      razas: Array.from(this.razasSeleccionadas),
      edades: Array.from(this.edadesSeleccionadas),
      pesos: Array.from(this.pesosSeleccionados),
      pelos: Array.from(this.pelosSeleccionados),
      caracteres: Array.from(this.caracteresSeleccionados),
      orden: this.ordenSeleccionado
    });
  }

  resetFiltros() {
    this.generosSeleccionados.clear();
    this.razasSeleccionadas.clear();
    this.edadesSeleccionadas.clear();
    this.pesosSeleccionados.clear();
    this.pelosSeleccionados.clear();
    this.caracteresSeleccionados.clear();
    this.ordenSeleccionado = '';

    // Si estás usando checkboxes en tu HTML controlados por template,
    // tendrías que resetear los inputs aquí también usando ViewChildren o ngModel.
    // Como solución simple temporal que emita el vaciado:
    this.emitirFiltros();

    // Solución "sucia" pero efectiva si usas puro HTML (sin NgModel):
    document.querySelectorAll('input[type=checkbox]').forEach((el: any) => el.checked = false);
    const selectEl = document.querySelector('select') as HTMLSelectElement;
    if (selectEl) selectEl.value = '';
  }
}
