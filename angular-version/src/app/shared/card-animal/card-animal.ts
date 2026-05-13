import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data';
import { Animal } from '../../models/animal';
import { FavoritesService } from '../../services/favorites';
import { AuthService } from '../../services/auth';

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

  constructor(
    private router: Router,
    private dataService: DataService,
    private favoritesService: FavoritesService,
    private authService: AuthService,
  ) {}

  get isAuthenticated(): boolean {
    return !!this.authService.currentUser();
  }

  get isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.mascota?.id);
  }

  verPerfil() {
    this.router.navigate(['/pet-profile'], { queryParams: { id: this.mascota.id } });
  }

  toggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: this.router.url } });
      return;
    }

    if (this.esAdmin) {
      return;
    }

    this.favoritesService.toggle(this.mascota);
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
