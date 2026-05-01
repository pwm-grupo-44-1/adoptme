import { Component, OnInit, computed, signal } from '@angular/core';
import { AdminPanel } from '../../shared/admin-panel/admin-panel';
import { Filter } from '../../shared/filter/filter';
import { CardAnimal } from '../../shared/card-animal/card-animal';
import { DataService } from '../../services/data';
import { AuthService } from '../../services/auth';
import { Animal } from '../../models/animal';

@Component({
  selector: 'app-adoption-list',
  standalone: true,
  imports: [AdminPanel, Filter, CardAnimal],
  templateUrl: './adoption-list.html',
  styleUrl: './adoption-list.css',
})
export class AdoptionList implements OnInit {
  esAdmin = computed(() => this.authService.currentUser()?.type === 'admin');

  listaCompleta = signal<Animal[]>([]);
  listaFiltrada = signal<Animal[]>([]);

  constructor(private dataService: DataService, private authService: AuthService) {}

  ngOnInit(): void {
    this.dataService.mascotas$.subscribe(data => {
      this.listaCompleta.set(data);
      this.listaFiltrada.set(data);
    });
  }

  aplicarFiltros(criterios: any) {
    let filtrados = this.listaCompleta().filter((a: any) => {
      if (criterios.generos && criterios.generos.length > 0 && !criterios.generos.includes(a.gender)) return false;
      if (criterios.razas && criterios.razas.length > 0 && !criterios.razas.includes(a.breed)) return false;
      if (criterios.edades && criterios.edades.length > 0 && !criterios.edades.includes(this.ageRange(a.age))) return false;
      if (criterios.pesos && criterios.pesos.length > 0 && !criterios.pesos.includes(this.weightRange(a.weight))) return false;
      if (criterios.pelos && criterios.pelos.length > 0 && !criterios.pelos.includes(a["hair type"])) return false;
      if (criterios.caracteres && criterios.caracteres.length > 0 && !criterios.caracteres.includes(a.mood)) return false;
      return true;
    });

    filtrados = this.ordenarLista(filtrados, criterios.orden);
    this.listaFiltrada.set(filtrados);
  }

  private ageRange(age: number): string {
    if (age <= 2) return 'Cachorro (0-2 años)';
    if (age <= 6) return 'Adulto (3-6 años)';
    return 'Senior (7+ años)';
  }

  private parseWeight(w: string): number {
    return parseFloat(w) || 0;
  }

  private weightRange(w: string): string {
    const kg = this.parseWeight(w);
    if (kg <= 5) return 'Pequeño (≤5kg)';
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
