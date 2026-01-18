import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DocumentationComponent } from './components/documentation/documentation.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'docs', component: DocumentationComponent },
  { path: '**', redirectTo: '' }
];