import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AI_SERVICE_BASE_URL } from '../config/api.config';
import { CreateJobPayload } from './job.service';

export type JobDraft = CreateJobPayload;

@Injectable({
  providedIn: 'root'
})
export class AiJobDraftService {
  private readonly http = inject(HttpClient);

  generateDraft(prompt: string): Observable<JobDraft> {
    return this.http.post<JobDraft>(`${AI_SERVICE_BASE_URL}/generate-job-draft`, { prompt });
  }
}
