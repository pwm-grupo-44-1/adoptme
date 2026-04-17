import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { LocalJsonService } from './local-json';
import { Animal } from '../models/animal';
import {
  HeaderData, FooterData, HomeData, TeamMember,
  FaqItem, StoryItem, LegalItem, ContactUsData,
  ScheduleData, User
} from '../models/data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private mascotasSubject = new BehaviorSubject<Animal[]>([]);
  public mascotas$ = this.mascotasSubject.asObservable();

  // 🚀 LA MAGIA: Un observable cacheado que guarda toda la BBDD
  private db$: Observable<any>;

  constructor(private dataSource: LocalJsonService) {
    // Al usar shareReplay(1), Angular hace UNA sola petición HTTP.
    // Todos los componentes que se suscriban recibirán la respuesta al instante.
    this.db$ = this.dataSource.getFullDatabase().pipe(
      tap(db => this.procesarMascotas(db.animals || [])),
      shareReplay(1)
    );
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
    // Ya no necesitamos ifs complicados, el db$ ya está cacheado
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
  getUsers(): Observable<User[]> { return this.fetchSection<User[]>('users'); }
}
