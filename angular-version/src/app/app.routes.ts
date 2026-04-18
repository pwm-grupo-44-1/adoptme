import { Routes } from '@angular/router';
import { AdoptionList } from './pages/adoption-list/adoption-list';
import { PetProfile } from './pages/pet-profile/pet-profile';
import { Home } from './pages/home/home';
import { Stories } from './pages/stories/stories';
import { ContactUs } from './pages/contact-us/contact-us';
import { AboutUs } from './pages/about-us/about-us';
import { PetSchedule } from './pages/pet-schedule/pet-schedule';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'adoption-list', component: AdoptionList },
  { path: 'pet-profile', component: PetProfile },
  { path: 'pet-schedule', component: PetSchedule },
  { path: 'stories', component: Stories },
  { path: 'contact-us', component: ContactUs },
  { path: 'about-us', component: AboutUs },
  { path: '**', redirectTo: '' }
];
