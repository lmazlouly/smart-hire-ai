import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Job, JobService } from '../../services/job.service';

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './jobs-page.component.html'
})
export class JobsPageComponent implements OnInit {
  private readonly jobService = inject(JobService);

  jobs = signal<Job[]>([]);
  isLoading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.jobService.getJobs().subscribe({
      next: (data) => {
        this.jobs.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load jobs. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }
}
