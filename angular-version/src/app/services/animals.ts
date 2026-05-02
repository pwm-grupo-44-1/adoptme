import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { dbFirebase } from '../firebase';
import { Animal } from '../models/animal';

@Injectable({
  providedIn: 'root',
})
export class AnimalsService {
  private animalesRef = collection(dbFirebase, 'animals');

  async getAnimals(): Promise<Animal[]> {
    const querySnapshot = await getDocs(this.animalesRef);
    return querySnapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() } as Animal;
    });
  }

  async addAnimal(animal: Omit<Animal, 'id'>): Promise<string> {
    const docRef = await addDoc(this.animalesRef, animal);
    return docRef.id;
  }

  async deleteAnimal(id: string): Promise<void> {
    const docRef = doc(dbFirebase, 'animals', id);
    await deleteDoc(docRef);
  }

  async updateClicks(id: string, clicks: number): Promise<void> {
    const docRef = doc(dbFirebase, 'animals', id);
    await updateDoc(docRef, { clicks });
  }
}
