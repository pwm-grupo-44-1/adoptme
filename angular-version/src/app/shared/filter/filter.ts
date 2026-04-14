import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MascotasService } from '../../services/MascotasServices';

@Component({
  selector: 'app-filter',
  standalone: true,
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter implements OnInit {
  // Este "megáfono" enviará los datos al componente padre (AdoptionList)
  @Output() filtrosCambiados = new EventEmitter<any>();

  // Opciones dinámicas que rellenaremos leyendo la base de datos
  razas: string[] = [];
  pelos: string[] = [];
  caracteres: string[] = [];

  // El estado actual de todas las casillas
  criterios = {
    generos: [] as string[],
    razas: [] as string[],
    edades: [] as string[],
    pesos: [] as string[],
    pelos: [] as string[],
    caracteres: [] as string[],
    orden: ''
  };

  constructor(private mascotasService: MascotasService) {}

  ngOnInit() {
    this.mascotasService.mascotas$.subscribe(mascotas => {
      // Magia de JavaScript: Sacamos listas ÚNICAS de razas, pelos y caracteres
      this.razas = [...new Set(mascotas.map(m => m.breed))].filter(Boolean);
      this.pelos = [...new Set(mascotas.map(m => m['hair type']))].filter(Boolean);
      this.caracteres = [...new Set(mascotas.map(m => m.mood))].filter(Boolean);
    });
  }

  // Se ejecuta cada vez que marcas/desmarcas una casilla
  toggleFiltro(categoria: keyof typeof this.criterios, valor: string) {
    const lista = this.criterios[categoria] as string[];
    const index = lista.indexOf(valor);

    if (index > -1) {
      lista.splice(index, 1); // Si ya estaba marcado, lo quitamos
    } else {
      lista.push(valor); // Si no estaba, lo añadimos
    }

    this.emitirFiltros();
  }

  // Se ejecuta al cambiar el select de orden
  cambiarOrden(event: any) {
    this.criterios.orden = event.target.value;
    this.emitirFiltros();
  }

  // Para el botón de "Limpiar filtros"
  limpiarFiltros() {
    this.criterios = {
      generos: [], razas: [], edades: [], pesos: [], pelos: [], caracteres: [], orden: ''
    };
    this.emitirFiltros();
  }

  // Dispara el evento hacia afuera
  private emitirFiltros() {
    this.filtrosCambiados.emit(this.criterios);
  }
}
