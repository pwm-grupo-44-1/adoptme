import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Animal } from '../models/animal';
import { AppointmentBooking } from '../models/booking';

@Injectable({
  providedIn: 'root'
})
export class LocalJsonService {
  private dbUrl = '/db.json';
  private bookingsStorageKey = 'adoptme_bookings';

  constructor(private http: HttpClient) {}

  /** Extrae TODO el JSON de golpe */
  getFullDatabase(): Observable<any> {
    return this.http.get<any>(this.dbUrl);
  }

  // ==========================================
  // MANEJO DE LOCAL STORAGE (Simulando una BBDD real)
  // ==========================================

  getExtraAnimals(): Animal[] {
    return JSON.parse(localStorage.getItem('adoptme_extra_animals') || '[]');
  }

  saveExtraAnimal(animal: Animal): void {
    const locales = this.getExtraAnimals();
    locales.push(animal);
    localStorage.setItem('adoptme_extra_animals', JSON.stringify(locales));
  }

  getDeletedAnimalIds(): number[] {
    return JSON.parse(localStorage.getItem('adoptme_deleted_animals') || '[]');
  }

  saveDeletedAnimalId(id: number): void {
    const eliminados = this.getDeletedAnimalIds();
    if (!eliminados.includes(id)) {
      eliminados.push(id);
      localStorage.setItem('adoptme_deleted_animals', JSON.stringify(eliminados));
    }
  }

  getClicksData(): Record<number, number> {
    return JSON.parse(localStorage.getItem('adoptme_clicks') || '{}');
  }

  saveClickData(id: number, clicks: number): void {
    const clicksGuardados = this.getClicksData();
    clicksGuardados[id] = clicks;
    localStorage.setItem('adoptme_clicks', JSON.stringify(clicksGuardados));
  }

  getBookings(): AppointmentBooking[] {
    return JSON.parse(localStorage.getItem(this.bookingsStorageKey) || '[]');
  }

  saveBookings(bookings: AppointmentBooking[]): void {
    localStorage.setItem(this.bookingsStorageKey, JSON.stringify(bookings));
  }
}
