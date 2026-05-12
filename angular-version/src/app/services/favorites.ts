import { Injectable, effect, inject, signal } from '@angular/core';
import { Animal } from '../models/animal';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly authService = inject(AuthService);
  readonly favoriteIds = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      const currentUser = this.authService.currentUser();

      if (!currentUser?.id) {
        this.favoriteIds.set(new Set());
        return;
      }

      this.favoriteIds.set(this.readFavorites(currentUser.id));
    });
  }

  isFavorite(animalId: string | number | undefined): boolean {
    if (animalId === undefined || animalId === null) {
      return false;
    }

    return this.favoriteIds().has(String(animalId));
  }

  toggle(animal: Animal): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser?.id) {
      return false;
    }

    const nextFavorites = new Set(this.favoriteIds());
    const normalizedId = String(animal.id);

    if (nextFavorites.has(normalizedId)) {
      nextFavorites.delete(normalizedId);
    } else {
      nextFavorites.add(normalizedId);
    }

    this.favoriteIds.set(nextFavorites);
    this.persistFavorites(currentUser.id, nextFavorites);
    return true;
  }

  private readFavorites(userId: string): Set<string> {
    const raw = localStorage.getItem(this.storageKey(userId));

    if (!raw) {
      return new Set();
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set(parsed.map((id) => String(id))) : new Set();
    } catch {
      return new Set();
    }
  }

  private persistFavorites(userId: string, favorites: Set<string>): void {
    localStorage.setItem(this.storageKey(userId), JSON.stringify([...favorites]));
  }

  private storageKey(userId: string): string {
    return `adoptme_favorites_${userId}`;
  }
}
