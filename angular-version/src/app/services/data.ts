import { Injectable } from '@angular/core';
import { collection, collectionData, deleteDoc, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { LocalJsonService } from './local-json';
import { AnimalsService } from './animals';
import { Animal } from '../models/animal';
import { AppointmentBooking } from '../models/booking';
import { User } from '../models/user';
import {
  HeaderData, FooterData, HomeData, TeamMember,
  FaqItem, StoryItem, LegalItem, ContactUsData,
  ScheduleData
} from '../models/data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private mascotasSubject = new BehaviorSubject<Animal[]>([]);
  public mascotas$ = this.mascotasSubject.asObservable();

  private dbCache = new ReplaySubject<any>(1);
  private db$: Observable<any> = this.dbCache.asObservable();

  constructor(
    private dataSource: LocalJsonService,
    private firestore: Firestore,
    private animalsService: AnimalsService // Inyectamos el servicio de Firebase
  ) {
    // 1. Cargamos datos estáticos (Home, FAQ, etc.) desde el JSON local
    this.dataSource.getFullDatabase().pipe(take(1)).subscribe({
      next: (db) => {
        this.dbCache.next(db);
      },
      error: (err) => console.error('Error cargando BD local:', err)
    });

    // 2. Cargamos las mascotas de forma asíncrona desde Firebase
    this.cargarMascotasFirebase();
  }

  // ==========================================
  // LÓGICA DE MASCOTAS (CONECTADA A FIREBASE)
  // ==========================================
  private async cargarMascotasFirebase() {
    try {
      const animales = await this.animalsService.getAnimals();
      this.mascotasSubject.next(animales);
    } catch (error) {
      console.error('Error obteniendo animales de Firebase:', error);
    }
  }

  async agregarMascota(nueva: Animal) {
    try {
      // Quitamos el ID si viene (para que Firebase genere uno único)
      const { id, ...datosMascota } = nueva as any;

      // Guardamos en Firebase
      const nuevoId = await this.animalsService.addAnimal(datosMascota);

      // Actualizamos el estado local instantáneamente
      const animalCompleto = { ...nueva, id: nuevoId };
      const actuales = this.mascotasSubject.getValue();
      this.mascotasSubject.next([...actuales, animalCompleto]);

    } catch (error) {
      console.error('Error al agregar mascota en Firebase:', error);
    }
  }

  async eliminarMascota(id: string | number) {
    try {
      // Eliminamos de Firebase
      await this.animalsService.deleteAnimal(id.toString());

      // Actualizamos el estado local
      const filtradas = this.mascotasSubject.getValue().filter(a => a.id !== id);
      this.mascotasSubject.next(filtradas);

    } catch (error) {
      console.error('Error al eliminar mascota en Firebase:', error);
    }
  }

  async incrementarVisitas(id: string | number) {
    const listaActual = this.mascotasSubject.getValue();
    let nuevosClicks = 0;

    const listaActualizada = listaActual.map(mascota => {
      if (mascota.id === id) {
        nuevosClicks = (mascota.clicks || 0) + 1;
        return { ...mascota, clicks: nuevosClicks };
      }
      return mascota;
    });

    // Actualizamos el estado local (para reflejo inmediato en UI)
    this.mascotasSubject.next(listaActualizada);

    // Actualizamos en Firebase en segundo plano
    try {
      await this.animalsService.updateClicks(id.toString(), nuevosClicks);
    } catch(error) {
      console.error('Error actualizando clicks en Firebase:', error);
    }
  }

  // ==========================================
  // GETTERS DE DATOS ESTÁTICOS
  // ==========================================
  private fetchSection<T>(section: string): Observable<T> {
    return this.db$.pipe(map(db => db[section]));
  }

  getHomeData(): Observable<HomeData> { return this.fetchSection<HomeData>('home'); }
  getHeaderData(): Observable<HeaderData> { return this.fetchSection<HeaderData>('header'); }
  getFooterData(): Observable<FooterData> { return this.fetchSection<FooterData>('footer'); }
  getAboutUs(): Observable<TeamMember[]> { return this.fetchSection<TeamMember[]>('about_us'); }
  getFaq(): Observable<FaqItem[]> { return this.fetchSection<FaqItem[]>('faq'); }
  getStories(): Observable<StoryItem[]> { return this.fetchSection<StoryItem[]>('stories'); }
  getLegal(): Observable<LegalItem[]> { return this.fetchSection<LegalItem[]>('legal'); }
  getContactUs(): Observable<ContactUsData> { return this.fetchSection<ContactUsData>('contact_us'); }
  getSchedule(): Observable<ScheduleData> { return this.fetchSection<ScheduleData>('schedule'); }
  getUsers(): Observable<User[]> {
    return collectionData(collection(this.firestore, 'users'), { idField: 'id' }) as Observable<User[]>;
  }

  setUser(userId: string, user: User): Promise<void> {
    return setDoc(doc(this.firestore, 'users', userId), user);
  }

  updateUser(userId: string, data: Partial<User>): Promise<void> {
    return updateDoc(doc(this.firestore, 'users', userId), data);
  }

  getBookings(): Observable<AppointmentBooking[]> {
    return collectionData(collection(this.firestore, 'bookings')) as Observable<AppointmentBooking[]>;
  }

  addBooking(booking: AppointmentBooking): Promise<void> {
    return setDoc(doc(this.firestore, 'bookings', booking.id), booking);
  }

  updateBooking(bookingId: string, data: Partial<AppointmentBooking>): Promise<void> {
    return updateDoc(doc(this.firestore, 'bookings', bookingId), data);
  }

  deleteBooking(bookingId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, 'bookings', bookingId));
  }
}
