import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MascotasService {
  private dbUrl = '/db.json';

  private mascotasSubject = new BehaviorSubject<any[]>([]);
  mascotas$ = this.mascotasSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarMascotasIniciales();
  }

  private cargarMascotasIniciales() {
    console.log('🔎 1. Buscando el archivo en:', this.dbUrl);

    this.http.get<any>(this.dbUrl).subscribe({
      next: (db) => {
        console.log('✅ 2. Archivo db.json leído con éxito:', db);

        if (!db || !db.animals) {
          console.error('❌ 3. El archivo existe, pero no tiene la lista de "animals" dentro.');
          return;
        }

        try {
          const locales = JSON.parse(localStorage.getItem('adoptme_extra_animals') || '[]');
          const eliminados = JSON.parse(localStorage.getItem('adoptme_deleted_animals') || '[]');

          // 🚀 NUEVO: Recuperamos las visitas guardadas
          const clicksGuardados = JSON.parse(localStorage.getItem('adoptme_clicks') || '{}');

          console.log(`📊 4. Animales en db.json: ${db.animals.length}`);
          console.log(`📦 5. Animales nuevos en LocalStorage: ${locales.length}`);
          console.log(`🗑️ 6. IDs eliminados en LocalStorage:`, eliminados);

          let iniciales = [...db.animals, ...locales].filter(a => !eliminados.includes(a.id));

          // 🚀 NUEVO: Le inyectamos los clicks guardados a la lista inicial
          iniciales = iniciales.map(animal => {
            if (clicksGuardados[animal.id]) {
              return { ...animal, clicks: clicksGuardados[animal.id] };
            }
            return animal;
          });

          console.log(`🚀 7. Total final a mostrar: ${iniciales.length}`);

          this.mascotasSubject.next(iniciales);
        } catch (error) {
          console.error('❌ Error al leer LocalStorage:', error);
          this.mascotasSubject.next(db.animals);
        }
      }, // <-- ¡Faltaba cerrar esta llave del bloque next!
      error: (err) => {
        console.error('❌ 3. ERROR FATAL: Angular no encuentra el db.json.', err);
      }
    });
  }

  agregarMascota(nueva: any) {
    const actuales = this.mascotasSubject.value;
    const listaActualizada = [...actuales, nueva];

    const locales = JSON.parse(localStorage.getItem('adoptme_extra_animals') || '[]');
    locales.push(nueva);
    localStorage.setItem('adoptme_extra_animals', JSON.stringify(locales));

    this.mascotasSubject.next(listaActualizada);
  }

  eliminarMascota(id: number) {
    const actuales = this.mascotasSubject.value;
    const filtradas = actuales.filter(a => a.id !== id);

    const eliminados = JSON.parse(localStorage.getItem('adoptme_deleted_animals') || '[]');
    if (!eliminados.includes(id)) {
      eliminados.push(id);
    }
    localStorage.setItem('adoptme_deleted_animals', JSON.stringify(eliminados));

    this.mascotasSubject.next(filtradas);
  }

  // Función para sumar +1 a las visitas de una mascota y guardarlo
  incrementarVisitas(id: number) {
    const listaActual = this.mascotasSubject.getValue();
    let nuevosClicks = 0;

    const listaActualizada = listaActual.map((mascota: any) => {
      if (mascota.id === id) {
        nuevosClicks = (mascota.clicks || 0) + 1;
        return { ...mascota, clicks: nuevosClicks };
      }
      return mascota;
    });

    // 🚀 NUEVO: Guardar el nuevo número de visitas en el LocalStorage
    const clicksGuardados = JSON.parse(localStorage.getItem('adoptme_clicks') || '{}');
    clicksGuardados[id] = nuevosClicks;
    localStorage.setItem('adoptme_clicks', JSON.stringify(clicksGuardados));

    this.mascotasSubject.next(listaActualizada);
  }
}
