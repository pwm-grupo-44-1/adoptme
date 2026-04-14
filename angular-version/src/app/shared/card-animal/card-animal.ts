import { Component, Input } from '@angular/core';
import { MascotasService } from '../../services/MascotasServices';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-card-animal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './card-animal.html',
  styleUrl: './card-animal.css'
})
export class CardAnimal {
  @Input() datos: any;
  @Input() esAdmin: boolean = false;

  // Variable para controlar el modal personalizado
  mostrarModalEliminar: boolean = false;

  constructor(private mascotasService: MascotasService) {}

  // Abrir el modal
  abrirConfirmacion() {
    this.mostrarModalEliminar = true;
  }

  // Cerrar el modal sin hacer nada
  cancelarEliminacion() {
    this.mostrarModalEliminar = false;
  }

  // Confirmar y borrar de verdad
  confirmarEliminacion() {
    this.mascotasService.eliminarMascota(this.datos.id);
    this.mostrarModalEliminar = false;
  }
}
