import { Injectable, effect, inject, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Capacitor } from '@capacitor/core';
import { Animal } from '../models/animal';
import { doc, setDoc } from 'firebase/firestore';
import { User } from '../models/user';
import { AuthService } from './auth';
import { FavoritesLocalDbService } from './favorites-local-db';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly authService = inject(AuthService);
  private readonly localDb = inject(FavoritesLocalDbService);
  private readonly firestore = inject(Firestore);
  readonly favoriteIds = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      const currentUser = this.authService.currentUser();

      if (!currentUser?.id || currentUser.type === 'admin') {
        this.favoriteIds.set(new Set());
        return;
      }

      void this.loadFavorites(currentUser);
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

    const userId = currentUser.id;
    const normalizedId = String(animal.id);
    const previousFavorites = new Set(this.favoriteIds());
    const nextFavorites = new Set(previousFavorites);
    const isRemoving = nextFavorites.has(normalizedId);

    if (isRemoving) {
      nextFavorites.delete(normalizedId);
    } else {
      nextFavorites.add(normalizedId);
    }

    this.favoriteIds.set(nextFavorites);
    void this.persistToggle(userId, normalizedId, isRemoving, previousFavorites);
    return true;
  }

  private async loadFavorites(currentUser: User): Promise<void> {
    const userId = currentUser.id;
    if (!userId) {
      this.favoriteIds.set(new Set());
      return;
    }

    try {
      await this.migrateLegacyFavoritesIfNeeded(userId);
      const remoteFavorites = this.normalizeFavoriteIds(currentUser.favorites);

      if (this.isNativePlatform()) {
        const localFavorites = new Set(await this.localDb.getFavoriteIds(userId));
        const effectiveFavorites =
          remoteFavorites.size === 0 && localFavorites.size > 0
            ? localFavorites
            : remoteFavorites;

        if (remoteFavorites.size === 0 && localFavorites.size > 0) {
          await this.syncFavoritesToCloud(userId, localFavorites);
        }

        if (!this.areSetsEqual(localFavorites, effectiveFavorites)) {
          await this.localDb.replaceFavoriteIds(userId, [...effectiveFavorites]);
        }

        this.favoriteIds.set(new Set(effectiveFavorites));
        return;
      }

      const browserFavorites = new Set(await this.localDb.getFavoriteIds(userId));
      const effectiveFavorites =
        remoteFavorites.size === 0 && browserFavorites.size > 0
          ? browserFavorites
          : remoteFavorites;

      if (remoteFavorites.size === 0 && browserFavorites.size > 0) {
        await this.syncFavoritesToCloud(userId, browserFavorites);
      }

      if (!this.areSetsEqual(browserFavorites, effectiveFavorites)) {
        await this.localDb.replaceFavoriteIds(userId, [...effectiveFavorites]);
      }

      this.favoriteIds.set(new Set(effectiveFavorites));
    } catch (error) {
      console.error('No se pudieron cargar o sincronizar los favoritos:', error);
      this.favoriteIds.set(new Set());
    }
  }

  private async persistToggle(
    userId: string,
    animalId: string,
    isRemoving: boolean,
    previousFavorites: Set<string>,
  ): Promise<void> {
    try {
      if (isRemoving) {
        await this.localDb.removeFavorite(userId, animalId);
      } else {
        await this.localDb.addFavorite(userId, animalId);
      }

      await this.syncFavoritesToCloud(userId, this.favoriteIds());
      this.clearLegacyFavorites(userId);
    } catch (error) {
      console.error('No se pudieron guardar o sincronizar los favoritos:', error);
      this.favoriteIds.set(previousFavorites);
    }
  }

  private async migrateLegacyFavoritesIfNeeded(userId: string): Promise<void> {
    const legacyFavorites = this.readLegacyFavorites(userId);
    if (legacyFavorites.size === 0) {
      return;
    }

    await this.localDb.migrateLegacyFavorites(userId, [...legacyFavorites]);
    this.clearLegacyFavorites(userId);
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

  private clearLegacyFavorites(userId: string): void {
    localStorage.removeItem(this.storageKey(userId));
  }

  private normalizeFavoriteIds(favorites: string[] | undefined): Set<string> {
    return Array.isArray(favorites) ? new Set(favorites.map((id) => String(id))) : new Set();
  }

  private areSetsEqual(first: Set<string>, second: Set<string>): boolean {
    if (first.size !== second.size) {
      return false;
    }

    for (const value of first) {
      if (!second.has(value)) {
        return false;
      }
    }

    return true;
  }

  private async syncFavoritesToCloud(userId: string, favorites: Set<string>): Promise<void> {
    await setDoc(
      doc(this.firestore, 'users', userId),
      { favorites: [...favorites] },
      { merge: true },
    );
  }

  private isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  private storageKey(userId: string): string {
    return `adoptme_favorites_${userId}`;
  }
}
