import { Routes } from '@angular/router';
import {AdoptionList} from './pages/adoption-list/adoption-list';
import {PetProfile} from './pages/pet-profile/pet-profile';

export const routes: Routes = [
  { path: '', component: AdoptionList },
  { path: 'pet-profile', component: PetProfile },
  { path: '**', redirectTo: '' }
];
