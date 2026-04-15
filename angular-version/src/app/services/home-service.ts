import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HomeData } from '../models/home-data';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private jsonUrl = '/db.json';

  constructor(private http: HttpClient) { }

  getHomeData(): Observable<HomeData> {
    return this.http.get<any>(this.jsonUrl).pipe(
      map(db => db.home)
    );
  }
}
