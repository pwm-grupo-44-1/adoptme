import { Injectable, effect, inject, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Animal } from '../models/animal';
import { doc, setDoc } from 'firebase/firestore';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly authService = inject(AuthService);
  private readonly firestore = inject(Firestore);
  readonly favoriteIds = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      const currentUser = this.authService.currentUser();

      if (!currentUser?.id) {
        this.favoriteIds.set(new Set());
        return;
      }

      const remoteFavorites = this.normalizeFavorites(currentUser.favorites);
      this.favoriteIds.set(remoteFavorites);
      void this.migrateLegacyFavoritesIfNeeded(currentUser.id, currentUser.favorites, remoteFavorites);
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

    const previousFavorites = new Set(this.favoriteIds());
    const nextFavorites = new Set(previousFavorites);
    const normalizedId = String(animal.id);

    if (nextFavorites.has(normalizedId)) {
      nextFavorites.delete(normalizedId);
    } else {
      nextFavorites.add(normalizedId);
    }

    this.favoriteIds.set(nextFavorites);
    void this.persistFavorites(currentUser.id, nextFavorites, previousFavorites);
    return true;
  }

  private normalizeFavorites(favorites: string[] | undefined): Set<string> {
    return Array.isArray(favorites) ? new Set(favorites.map((id) => String(id))) : new Set();
  }

  private readLegacyFavorites(userId: string): Set<string> {
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

  private async persistFavorites(userId: string, favorites: Set<string>, previousFavorites: Set<string>): Promise<void> {
    try {
      await setDoc(
        doc(this.firestore, 'users', userId),
        { favorites: [...favorites] },
        { merge: true },
      );
      this.clearLegacyFavorites(userId);
    } catch (error) {
      console.error('No se pudieron guardar los favoritos en Firebase:', error);
      this.favoriteIds.set(previousFavorites);
    }
  }

  private async migrateLegacyFavoritesIfNeeded(
    userId: string,
    remoteFavorites: string[] | undefined,
    currentFavorites: Set<string>,
  ): Promise<void> {
    if (Array.isArray(remoteFavorites)) {
      return;
    }

    const legacyFavorites = this.readLegacyFavorites(userId);
    if (legacyFavorites.size === 0) {
      return;
    }

    this.favoriteIds.set(legacyFavorites);

    try {
      await setDoc(
        doc(this.firestore, 'users', userId),
        { favorites: [...legacyFavorites] },
        { merge: true },
      );
      this.clearLegacyFavorites(userId);
    } catch (error) {
      console.error('No se pudieron migrar los favoritos antiguos a Firebase:', error);
      this.favoriteIds.set(currentFavorites);
    }
  }

  private storageKey(userId: string): string {
    return `adoptme_favorites_${userId}`;
  }

  private clearLegacyFavorites(userId: string): void {
    localStorage.removeItem(this.storageKey(userId));
  }
}
