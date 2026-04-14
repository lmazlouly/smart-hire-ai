import { Routes } from '@angular/router';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { RecruiterComponent } from './pages/recruiter/recruiter.component';
import { CandidateComponent } from './pages/candidate/candidate.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent
      }
    ]
  },
  {
    path: 'recruiter',
    component: RecruiterComponent
  },
  {
    path: 'candidate',
    component: CandidateComponent
  }
];
