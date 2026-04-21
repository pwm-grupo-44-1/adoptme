import { Injectable, signal } from '@angular/core';
import {User} from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Usamos un Signal para que cualquier componente se entere al instante del cambio de usuario
  currentUser = signal<User | null>(this.getUserFromStorage());

  private getUserFromStorage(): User | null {
    const data = localStorage.getItem('userActive');
    return data ? JSON.parse(data) : null;
  }

  login(user: User) {
    localStorage.setItem('userActive', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('userActive');
    this.currentUser.set(null);
  }
}
