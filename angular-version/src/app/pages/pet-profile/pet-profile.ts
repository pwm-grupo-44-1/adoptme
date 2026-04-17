import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';
import { Animal } from '../../models/animal';

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-profile.html',
  styleUrl: './pet-profile.css'
})
export class PetProfile implements OnInit {
  mascota = signal<Animal | null>(null);
  currentImageIndex = signal(0);
  isAnimating = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = +params['id'];

      if (id) {
        this.dataService.incrementarVisitas(id);
      }

      this.dataService.mascotas$.subscribe(lista => {
        // 🚀 LA SOLUCIÓN: Si la lista está vacía, estamos esperando al JSON. No hagas nada.
        if (lista.length === 0) return;

        const encontrada = lista.find(m => m.id === id);

        if (encontrada) {
          this.mascota.set(encontrada);
        } else {
          // Solo te echa si el JSON ya cargó y el animal de verdad no existe
          this.router.navigate(['/adoption-list']);
        }
      });
    });
  }

  nextImage() {
    const animal = this.mascota();
    if (!animal) return;
    const totalOriginals = animal.images.length;

    this.isAnimating.set(true);
    this.currentImageIndex.update(i => i + 1);

    if (this.currentImageIndex() === totalOriginals) {
      setTimeout(() => {
        this.isAnimating.set(false);
        this.currentImageIndex.set(0);
      }, 400);
    }
  }

  prevImage() {
    const animal = this.mascota();
    if (!animal) return;
    const totalOriginals = animal.images.length;

    if (this.currentImageIndex() === 0) {
      this.isAnimating.set(false);
      this.currentImageIndex.set(totalOriginals);

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
    this.router.navigate(['/adoption-list']);
  }
}
