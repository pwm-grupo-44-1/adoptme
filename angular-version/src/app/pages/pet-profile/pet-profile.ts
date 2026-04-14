import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MascotasService } from '../../services/MascotasServices';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-profile.html',
  styleUrl: './pet-profile.css'
})
export class PetProfile implements OnInit {
  mascota = signal<any>(null);
  currentImageIndex = signal(0);
  // Controla si la transición CSS está activa o no
  isAnimating = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mascotasService: MascotasService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = +params['id'];
      this.mascotasService.mascotas$.subscribe(lista => {
        const encontrada = lista.find((m: any) => m.id === id);
        if (encontrada) {
          this.mascota.set(encontrada);
        } else {
          this.router.navigate(['/']);
        }
      });
    });
  }

  nextImage() {
    const totalOriginals = this.mascota().images.length;

    this.isAnimating.set(true);
    this.currentImageIndex.update(i => i + 1);

    // Si llegamos al clon (la posición después de la última)
    if (this.currentImageIndex() === totalOriginals) {
      setTimeout(() => {
        // Desactivamos la animación y saltamos al inicio real (0)
        this.isAnimating.set(false);
        this.currentImageIndex.set(0);
      }, 400); // 400ms debe coincidir con el tiempo del CSS transition
    }
  }

  prevImage() {
    const totalOriginals = this.mascota().images.length;

    if (this.currentImageIndex() === 0) {
      // Si estamos en el inicio y queremos ir atrás:
      // 1. Saltamos al clon sin que se vea
      this.isAnimating.set(false);
      this.currentImageIndex.set(totalOriginals);

      // 2. Un pequeño delay para que el navegador procese el cambio y luego animamos hacia la última real
      setTimeout(() => {
        this.isAnimating.set(true);
        this.currentImageIndex.set(totalOriginals - 1);
      }, 20);
    } else {
      this.isAnimating.set(true);
      this.currentImageIndex.update(i => i - 1);
    }
  }

  volver() {
    this.router.navigate(['/']);
  }
}
