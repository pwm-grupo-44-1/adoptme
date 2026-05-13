import { Component, computed, effect, signal } from '@angular/core';
import { Filter } from '../../shared/filter/filter';
import { CardAnimal } from '../../shared/card-animal/card-animal';
import { DataService } from '../../services/data';
import { FavoritesService } from '../../services/favorites';
import { Animal } from '../../models/animal';

interface FavoriteFilters {
  generos: string[];
  razas: string[];
  edades: string[];
  pesos: string[];
  pelos: string[];
  caracteres: string[];
  orden: string;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [Filter, CardAnimal],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites {
  listaCompleta = signal<Animal[]>([]);
  listaFiltrada = signal<Animal[]>([]);
  totalFavoritos = computed(() => this.favoritesService.favoriteIds().size);

  private readonly filtrosActivos = signal<FavoriteFilters>({
    generos: [],
    razas: [],
    edades: [],
    pesos: [],
    pelos: [],
    caracteres: [],
    orden: '',
  });

  constructor(
    private dataService: DataService,
    private favoritesService: FavoritesService,
  ) {
    this.dataService.mascotas$.subscribe((data) => {
      this.listaCompleta.set(data);
    });

    effect(() => {
      const listaBase = this.listaCompleta();
      this.favoritesService.favoriteIds();
      this.listaFiltrada.set(this.filtrarYOrdenar(listaBase, this.filtrosActivos()));
    });
  }

  aplicarFiltros(criterios: FavoriteFilters) {
    this.filtrosActivos.set(criterios);
  }

  private filtrarYOrdenar(lista: Animal[], criterios: FavoriteFilters): Animal[] {
    let filtrados = lista.filter((animal) => {
      if (criterios.generos.length > 0 && !criterios.generos.includes(animal.gender)) return false;
      if (criterios.razas.length > 0 && !criterios.razas.includes(animal.breed)) return false;
      if (criterios.edades.length > 0 && !criterios.edades.includes(this.ageRange(animal.age))) return false;
      if (criterios.pesos.length > 0 && !criterios.pesos.includes(this.weightRange(animal.weight))) return false;
      if (criterios.pelos.length > 0 && !criterios.pelos.includes(animal['hair type'])) return false;
      if (criterios.caracteres.length > 0 && !criterios.caracteres.includes(animal.mood)) return false;
      return true;
    });

    filtrados = this.ordenarLista(filtrados, criterios.orden);
    return filtrados;
  }

  private ageRange(age: number): string {
    if (age <= 2) return 'Cachorro (0-2 aÃ±os)';
    if (age <= 6) return 'Adulto (3-6 aÃ±os)';
    return 'Senior (7+ aÃ±os)';
  }

  private parseWeight(weight: string): number {
    return parseFloat(weight) || 0;
  }

  private weightRange(weight: string): string {
    const kg = this.parseWeight(weight);
    if (kg <= 5) return 'PequeÃ±o (â‰¤5kg)';
    if (kg <= 15) return 'Mediano (6-15kg)';
    return 'Grande (>15kg)';
  }

  private ordenarLista(lista: Animal[], orden: string): Animal[] {
    const copia = [...lista];
    if (orden === 'age-asc') copia.sort((a, b) => a.age - b.age);
    if (orden === 'age-desc') copia.sort((a, b) => b.age - a.age);
    if (orden === 'weight-asc') copia.sort((a, b) => this.parseWeight(a.weight) - this.parseWeight(b.weight));
    if (orden === 'weight-desc') copia.sort((a, b) => this.parseWeight(b.weight) - this.parseWeight(a.weight));
    return copia;
  }
}
