import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { LocalJsonService } from './local-json';
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

  // 🚀 LA MAGIA DEFINITIVA: ReplaySubject para evitar el bug del F5
  private dbCache = new ReplaySubject<any>(1);
  private db$: Observable<any> = this.dbCache.asObservable();

  constructor(private dataSource: LocalJsonService, private firestore: Firestore) {
    // take(1) asegura que la petición HTTP se haga estrictamente 1 vez al arrancar
    this.dataSource.getFullDatabase().pipe(take(1)).subscribe({
      next: (db) => {
        this.procesarMascotas(db.animals || []);
        // Guardamos todo el JSON en el caché blindado
        this.dbCache.next(db);
      },
      error: (err) => console.error('Error cargando BD:', err)
    });
  }

  // ==========================================
  // LÓGICA DE MASCOTAS
  // ==========================================
  private procesarMascotas(animalesBase: Animal[]) {
    try {
      const extras = this.dataSource.getExtraAnimals();
      const eliminados = this.dataSource.getDeletedAnimalIds();
      const clicks = this.dataSource.getClicksData();

      let listaFinal = [...animalesBase, ...extras].filter(a => !eliminados.includes(a.id));

      listaFinal = listaFinal.map(animal => ({
        ...animal,
        clicks: clicks[animal.id] !== undefined ? clicks[animal.id] : (animal.clicks || 0)
      }));

      this.mascotasSubject.next(listaFinal);
    } catch (error) {
      console.error('Error procesando mascotas:', error);
      this.mascotasSubject.next(animalesBase);
    }
  }

  agregarMascota(nueva: Animal) {
    this.dataSource.saveExtraAnimal(nueva);
    const actuales = this.mascotasSubject.getValue();
    this.mascotasSubject.next([...actuales, nueva]);
  }

  eliminarMascota(id: number) {
    this.dataSource.saveDeletedAnimalId(id);
    const filtradas = this.mascotasSubject.getValue().filter(a => a.id !== id);
    this.mascotasSubject.next(filtradas);
  }

  incrementarVisitas(id: number) {
    const listaActual = this.mascotasSubject.getValue();
    let nuevosClicks = 0;

    const listaActualizada = listaActual.map(mascota => {
      if (mascota.id === id) {
        nuevosClicks = (mascota.clicks || 0) + 1;
        return { ...mascota, clicks: nuevosClicks };
      }
      return mascota;
    });

    this.dataSource.saveClickData(id, nuevosClicks);
    this.mascotasSubject.next(listaActualizada);
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

  addUser(user: User): Promise<void> {
    return addDoc(collection(this.firestore, 'users'), user).then(() => undefined);
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
