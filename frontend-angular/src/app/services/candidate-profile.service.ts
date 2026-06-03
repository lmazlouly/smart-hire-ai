import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface CandidateProfile {
  id: number;
  fullName: string;
  email: string;
  skills: string[];
  experienceYears: number | null;
  educationLevel: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateProfileService {
  private readonly http = inject(HttpClient);

  getMyProfile(): Observable<CandidateProfile> {
    return this.http.get<CandidateProfile>(`${API_BASE_URL}/candidates/me`);
  }
}
