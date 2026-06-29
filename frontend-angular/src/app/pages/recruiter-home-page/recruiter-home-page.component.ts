import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Job, JobService } from '../../services/job.service';

@Component({
  selector: 'app-recruiter-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recruiter-home-page.component.html'
})
export class RecruiterHomePageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly jobService = inject(JobService);

  jobs = signal<Job[]>([]);
  isLoadingJobs = signal(true);
  jobsError = signal('');

  get fullName(): string {
    return this.authService.getFullName();
  }

  get activeJobsCount(): number {
    return this.jobs().filter((job) => (job.status || 'Open').toLowerCase() === 'open').length;
  }

  get reviewJobsCount(): number {
    return this.jobs().filter((job) => (job.status || '').toLowerCase().includes('review')).length;
  }

  get recentJobs(): Job[] {
    return this.jobs().slice(0, 4);
  }

  ngOnInit(): void {
    this.jobService.getMyJobs().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.isLoadingJobs.set(false);
      },
      error: () => {
        this.jobsError.set('Failed to load dashboard data.');
        this.isLoadingJobs.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
