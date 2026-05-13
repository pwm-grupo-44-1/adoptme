import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

@Injectable({ providedIn: 'root' })
export class FavoritesLocalDbService {
  private readonly dbName = 'adoptme_local';
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private connection: SQLiteDBConnection | null = null;
  private initPromise: Promise<void> | null = null;

  async getFavoriteIds(userId: string): Promise<string[]> {
    if (!userId) {
      return [];
    }

    if (!this.isNativePlatform()) {
      return this.readBrowserFavorites(userId);
    }

    const db = await this.getConnection();
    const result = await db.query(
      'SELECT animal_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC;',
      [userId],
    );

    const rows = result.values ?? [];
    return rows.map((row) => String(row.animal_id));
  }

  async addFavorite(userId: string, animalId: string): Promise<void> {
    if (!userId) {
      return;
    }

    if (!this.isNativePlatform()) {
      const favorites = new Set(this.readBrowserFavorites(userId));
      favorites.add(animalId);
      this.writeBrowserFavorites(userId, [...favorites]);
      return;
    }

    const db = await this.getConnection();
    await db.run(
      'INSERT OR REPLACE INTO favorites (user_id, animal_id, created_at) VALUES (?, ?, ?);',
      [userId, animalId, new Date().toISOString()],
    );
  }

  async removeFavorite(userId: string, animalId: string): Promise<void> {
    if (!userId) {
      return;
    }

    if (!this.isNativePlatform()) {
      const favorites = this.readBrowserFavorites(userId).filter((id) => id !== animalId);
      this.writeBrowserFavorites(userId, favorites);
      return;
    }

    const db = await this.getConnection();
    await db.run('DELETE FROM favorites WHERE user_id = ? AND animal_id = ?;', [userId, animalId]);
  }

  async migrateLegacyFavorites(userId: string, animalIds: string[]): Promise<void> {
    if (!userId || animalIds.length === 0) {
      return;
    }

    const uniqueIds = [...new Set(animalIds.map((id) => String(id)))];

    if (!this.isNativePlatform()) {
      this.writeBrowserFavorites(userId, uniqueIds);
      return;
    }

    const db = await this.getConnection();
    for (const animalId of uniqueIds) {
      await db.run(
        'INSERT OR REPLACE INTO favorites (user_id, animal_id, created_at) VALUES (?, ?, ?);',
        [userId, animalId, new Date().toISOString()],
      );
    }
  }

  async replaceFavoriteIds(userId: string, animalIds: string[]): Promise<void> {
    if (!userId) {
      return;
    }

    const uniqueIds = [...new Set(animalIds.map((id) => String(id)))];

    if (!this.isNativePlatform()) {
      this.writeBrowserFavorites(userId, uniqueIds);
      return;
    }

    const db = await this.getConnection();
    await db.run('DELETE FROM favorites WHERE user_id = ?;', [userId]);

    for (const animalId of uniqueIds) {
      await db.run(
        'INSERT OR REPLACE INTO favorites (user_id, animal_id, created_at) VALUES (?, ?, ?);',
        [userId, animalId, new Date().toISOString()],
      );
    }
  }

  private async getConnection(): Promise<SQLiteDBConnection> {
    if (this.connection) {
      return this.connection;
    }

    if (!this.initPromise) {
      this.initPromise = this.initialize();
    }

    await this.initPromise;

    if (!this.connection) {
      throw new Error('No se pudo inicializar la base de datos local de favoritos.');
    }

    return this.connection;
  }

  private async initialize(): Promise<void> {
    const hasConnection = await this.sqlite.isConnection(this.dbName, false);

    if (hasConnection.result) {
      this.connection = await this.sqlite.retrieveConnection(this.dbName, false);
    } else {
      this.connection = await this.sqlite.createConnection(
        this.dbName,
        false,
        'no-encryption',
        1,
        false,
      );
    }

    await this.connection.open();
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id TEXT NOT NULL,
        animal_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (user_id, animal_id)
      );
    `);
  }

  private isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  private readBrowserFavorites(userId: string): string[] {
    try {
      const raw = localStorage.getItem(this.storageKey(userId));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
    } catch {
      return [];
    }
  }

  private writeBrowserFavorites(userId: string, favorites: string[]): void {
    localStorage.setItem(this.storageKey(userId), JSON.stringify(favorites));
  }

  private storageKey(userId: string): string {
    return `adoptme_favorites_db_${userId}`;
  }
}
