import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';

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

          console.log(`📊 4. Animales en db.json: ${db.animals.length}`);
          console.log(`📦 5. Animales nuevos en LocalStorage: ${locales.length}`);
          console.log(`🗑️ 6. IDs eliminados en LocalStorage:`, eliminados);

          const iniciales = [...db.animals, ...locales].filter(a => !eliminados.includes(a.id));

          console.log(`🚀 7. Total final a mostrar: ${iniciales.length}`);

          this.mascotasSubject.next(iniciales);
        } catch (error) {
          console.error('❌ Error al leer LocalStorage:', error);
          this.mascotasSubject.next(db.animals);
        }
      },
      error: (err) => {
        console.error('❌ 3. ERROR FATAL: Angular no encuentra el db.json. Verifica la carpeta public.', err);
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

  // Función para sumar +1 a las visitas de una mascota
  incrementarVisitas(id: number) {
    // Obtenemos la lista actual de mascotas que tengas guardada
    // IMPORTANTE: Cambia "this.mascotasSubject" por el nombre de tu BehaviorSubject o variable que uses.
    const listaActual = this.mascotasSubject.getValue();

    const listaActualizada = listaActual.map((mascota: any) => {
      if (mascota.id === id) {
        // Si no tiene clicks guardados, asume que es 0, y le suma 1
        return { ...mascota, clicks: (mascota.clicks || 0) + 1 };
      }
      return mascota;
    });

    // Actualizamos la lista global para que Angular repinte las tarjetas
    // IMPORTANTE: Cambia "this.mascotasSubject" por el nombre de tu variable
    this.mascotasSubject.next(listaActualizada);
  }
}
