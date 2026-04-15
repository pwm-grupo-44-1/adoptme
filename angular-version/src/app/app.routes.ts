import { Routes } from '@angular/router';
import {AdoptionList} from './pages/adoption-list/adoption-list';
import {PetProfile} from './pages/pet-profile/pet-profile';
import {Home} from './pages/home/home';

export const routes: Routes = [
  { path: 'adoption-list', component: AdoptionList },
  { path: 'pet-profile', component: PetProfile },
  { path: '**', redirectTo: '' },
  { path: '', component: Home }
];
