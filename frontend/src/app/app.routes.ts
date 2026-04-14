import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CandidateComponent } from './pages/candidate/candidate.component';
import { RecruiterComponent } from './pages/recruiter/recruiter.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'candidate', component: CandidateComponent },
  { path: 'recruiter', component: RecruiterComponent }
];
