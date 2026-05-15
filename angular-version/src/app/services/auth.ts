import { Injectable, inject, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Capacitor } from '@capacitor/core';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { Unsubscribe, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { User } from '../models/user';
import { EmailService } from './email';

class AuthFlowError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebaseAuth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly emailService = inject(EmailService);

  readonly currentUser = signal<User | null>(null);
  readonly authReady = signal(false);

  private profileWatchStop: Unsubscribe | null = null;
  private watchedUid: string | null = null;
  private readyResolver: (() => void) | null = null;
  private readonly readyPromise = new Promise<void>((resolve) => {
    this.readyResolver = resolve;
  });

  constructor() {
    void setPersistence(this.firebaseAuth, browserLocalPersistence).catch((error) => {
      console.error('No se pudo configurar la persistencia de Firebase Auth:', error);
    });

    onAuthStateChanged(this.firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        this.stopProfileWatcher();
        this.currentUser.set(null);
        this.markAuthReady();
        return;
      }

      try {
        await this.bootstrapSession(firebaseUser, this.isGoogleProvider(firebaseUser));
      } catch (error) {
        console.error('No se pudo restaurar la sesion autenticada:', error);
        this.currentUser.set(null);
        await signOut(this.firebaseAuth).catch(() => undefined);
      } finally {
        this.markAuthReady();
      }
    });
  }

  async waitUntilReady(): Promise<void> {
    await this.readyPromise;
  }

  async loginWithEmailPassword(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(this.firebaseAuth, email, password);

    try {
      return await this.bootstrapSession(credential.user, false);
    } catch (error) {
      await signOut(this.firebaseAuth).catch(() => undefined);
      throw error;
    }
  }

  async registerWithEmailPassword(name: string, email: string, phone: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
    const authUser = credential.user;

    if (name.trim()) {
      await updateProfile(authUser, { displayName: name.trim() });
    }

    await setDoc(doc(this.firestore, 'users', authUser.uid), {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      favorites: [],
      type: 'user',
      banned: false,
    });

    // Envío de email de verificación vía EmailJS
    void this.emailService.sendVerificationEmail(name.trim(), email.trim());

    // Envío de email de bienvenida (EmailJS)
    void this.emailService.sendWelcomeEmail(name.trim(), email.trim());
  }

  async loginWithGoogle(): Promise<User | null> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    if (Capacitor.isNativePlatform()) {
      await signInWithRedirect(this.firebaseAuth, provider);
      return null;
    }

    const credential = await signInWithPopup(this.firebaseAuth, provider);

    try {
      return await this.bootstrapSession(credential.user, true);
    } catch (error) {
      await signOut(this.firebaseAuth).catch(() => undefined);
      throw error;
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(this.firebaseAuth, email);
  }

  async logout(): Promise<void> {
    await signOut(this.firebaseAuth);
  }

  private async bootstrapSession(firebaseUser: import('firebase/auth').User, allowProfileCreate: boolean): Promise<User> {
    const profile = await this.loadOrCreateProfile(firebaseUser, allowProfileCreate);
    if (profile.banned) {
      throw new AuthFlowError('auth/user-banned');
    }

    this.currentUser.set(profile);
    this.ensureProfileWatcher(firebaseUser.uid);
    return profile;
  }

  private async loadOrCreateProfile(
    firebaseUser: import('firebase/auth').User,
    allowProfileCreate: boolean,
  ): Promise<User> {
    const userRef = doc(this.firestore, 'users', firebaseUser.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      if (!allowProfileCreate) {
        throw new AuthFlowError('auth/profile-not-found');
      }

      const newProfile: Omit<User, 'id'> = {
        name: firebaseUser.displayName?.trim() || firebaseUser.email?.split('@')[0] || 'Usuario',
        email: firebaseUser.email?.trim() || '',
        phone: '',
        favorites: [],
        type: 'user',
        banned: false,
      };

      await setDoc(userRef, newProfile);

      // Envío de email de bienvenida para registros vía Google
      void this.emailService.sendWelcomeEmail(newProfile.name, newProfile.email);

      return { id: firebaseUser.uid, ...newProfile };
    }

    const existingProfile = {
      id: snapshot.id,
      ...(snapshot.data() as Omit<User, 'id'>),
    };

    if (allowProfileCreate) {
      const profileUpdates: Partial<User> = {};
      const normalizedAuthEmail = firebaseUser.email?.trim() || '';
      const normalizedAuthName = firebaseUser.displayName?.trim() || existingProfile.name;

      if (normalizedAuthEmail && normalizedAuthEmail !== existingProfile.email) {
        profileUpdates.email = normalizedAuthEmail;
      }

      if (normalizedAuthName && normalizedAuthName !== existingProfile.name) {
        profileUpdates.name = normalizedAuthName;
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateDoc(userRef, profileUpdates);
        return { ...existingProfile, ...profileUpdates };
      }
    }

    return existingProfile;
  }

  private ensureProfileWatcher(uid: string): void {
    if (this.watchedUid === uid && this.profileWatchStop) {
      return;
    }

    this.stopProfileWatcher();

    const userRef = doc(this.firestore, 'users', uid);
    this.watchedUid = uid;
    this.profileWatchStop = onSnapshot(
      userRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          this.currentUser.set(null);
          await signOut(this.firebaseAuth).catch(() => undefined);
          return;
        }

        const profile = {
          id: snapshot.id,
          ...(snapshot.data() as Omit<User, 'id'>),
        };

        if (profile.banned) {
          this.currentUser.set(null);
          await signOut(this.firebaseAuth).catch(() => undefined);
          return;
        }

        this.currentUser.set(profile);
      },
      async (error) => {
        console.error('Error escuchando el perfil del usuario autenticado:', error);
        this.currentUser.set(null);
        await signOut(this.firebaseAuth).catch(() => undefined);
      },
    );
  }

  private stopProfileWatcher(): void {
    if (this.profileWatchStop) {
      this.profileWatchStop();
    }

    this.profileWatchStop = null;
    this.watchedUid = null;
  }

  private requiresEmailVerification(firebaseUser: import('firebase/auth').User): boolean {
    return firebaseUser.providerData.some((provider) => provider.providerId === 'password');
  }

  private isGoogleProvider(firebaseUser: import('firebase/auth').User): boolean {
    return firebaseUser.providerData.some((provider) => provider.providerId === 'google.com');
  }

  private markAuthReady(): void {
    if (!this.authReady()) {
      this.authReady.set(true);
    }

    if (this.readyResolver) {
      this.readyResolver();
      this.readyResolver = null;
    }
  }
}
