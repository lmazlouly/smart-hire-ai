import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Job, JobService } from '../../services/job.service';

@Component({
  selector: 'app-recruiter-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recruiter-dashboard-page.component.html'
})
export class RecruiterDashboardPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly jobService = inject(JobService);

  jobs = signal<Job[]>([]);
  isLoadingJobs = signal(true);
  jobsError = signal('');

  readonly mockCandidates = [
    { name: 'Nadia Amrani', initials: 'NA', score: 92, skills: 'Java, Spring Boot' },
    { name: 'Youssef Benali', initials: 'YB', score: 88, skills: 'PostgreSQL, React' },
    { name: 'Meriem Zahra', initials: 'MZ', score: 84, skills: 'Node.js, Docker' },
    { name: 'Karim Idrissi', initials: 'KI', score: 79, skills: 'Angular, TypeScript' }
  ];

  get fullName(): string {
    return this.authService.getFullName();
  }

  ngOnInit(): void {
    this.jobService.getJobs().subscribe({
      next: (data) => {
        this.jobs.set(data);
        this.isLoadingJobs.set(false);
      },
      error: () => {
        this.jobsError.set('Failed to load jobs.');
        this.isLoadingJobs.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getScoreColor(score: number): string {
    if (score >= 90) return '#22C55E';
    if (score >= 80) return '#4F46E5';
    return '#8B5CF6';
  }
}
