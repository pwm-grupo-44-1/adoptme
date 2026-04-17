import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data';
import { Animal } from '../../models/animal';

@Component({
  selector: 'app-card-animal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './card-animal.html',
  styleUrl: './card-animal.css'
})
export class CardAnimal {
  @Input() mascota!: Animal;
  @Input() esAdmin: boolean = false;

  mostrarModalEliminar: boolean = false;

  constructor(private router: Router, private dataService: DataService) {}

  verPerfil() {
    this.router.navigate(['/pet-profile'], { queryParams: { id: this.mascota.id } });
  }

  abrirConfirmacion() {
    this.mostrarModalEliminar = true;
  }

  cancelarEliminacion() {
    this.mostrarModalEliminar = false;
  }

  confirmarEliminacion() {
    this.dataService.eliminarMascota(this.mascota.id);
    this.mostrarModalEliminar = false;
  }
}
