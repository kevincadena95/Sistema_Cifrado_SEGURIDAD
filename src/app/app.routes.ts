
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { CifradoSimetrico } from './components/cifrado-simetrico/cifrado-simetrico';
import { CifradoAsimetrico } from './components/cifrado-asimetrico/cifrado-asimetrico';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cifrado-simetrico', component: CifradoSimetrico },
  { path: 'cifrado-asimetrico', component: CifradoAsimetrico },
  { path: '**', redirectTo: '' }
];
