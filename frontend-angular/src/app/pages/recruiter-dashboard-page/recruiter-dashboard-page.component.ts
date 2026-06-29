import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CreateJobPayload, Job, JobService } from '../../services/job.service';

@Component({
  selector: 'app-recruiter-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recruiter-dashboard-page.component.html'
})
export class RecruiterDashboardPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly jobService = inject(JobService);

  jobs = signal<Job[]>([]);
  isLoadingJobs = signal(true);
  jobsError = signal('');
  selectedJob = signal<Job | null>(null);
  expandedJobIds = signal<Set<number>>(new Set());
  searchTerm = signal('');
  isSaving = signal(false);
  saveError = signal('');
  saveSuccess = signal('');
  skillsInput = '';
  form: CreateJobPayload = this.emptyForm();
  readonly statusOptions = ['Open', 'Review', 'Closed'];

  get fullName(): string {
    return this.authService.getFullName();
  }

  ngOnInit(): void {
    this.jobService.getMyJobs().subscribe({
      next: (data) => {
        this.jobs.set(data);
        if (data.length > 0) {
          this.selectJob(data[0]);
        }
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

  filteredJobs(): Job[] {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.jobs();
    }

    return this.jobs().filter((job) => {
      const content = [
        job.title,
        job.company,
        job.location,
        job.department,
        job.workMode,
        job.employmentType,
        job.salaryRange,
        ...(job.requiredSkills ?? [])
      ].join(' ').toLowerCase();

      return content.includes(query);
    });
  }

  get activeJobsCount(): number {
    return this.jobs().filter((job) => (job.status || 'Open').toLowerCase() === 'open').length;
  }

  get reviewJobsCount(): number {
    return this.jobs().filter((job) => (job.status || '').toLowerCase().includes('review')).length;
  }

  get totalApplicationsEstimate(): number {
    return this.jobs().reduce((total, job) => total + Math.max(6, (job.requiredSkills?.length ?? 1) * 4 + (job.minimumExperienceYears ?? 0)), 0);
  }

  get totalViewsEstimate(): number {
    return this.jobs().reduce((total, job) => total + Math.max(24, (job.requiredSkills?.length ?? 1) * 18 + (job.minimumExperienceYears ?? 0) * 5), 0);
  }

  get parsedSkills(): string[] {
    return this.skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
  }

  visibleSkills(job: Job): string[] {
    return (job.requiredSkills ?? []).slice(0, 3);
  }

  hiddenSkillsCount(job: Job): number {
    return Math.max(0, (job.requiredSkills?.length ?? 0) - this.visibleSkills(job).length);
  }

  isExpanded(job: Job): boolean {
    return this.expandedJobIds().has(job.id);
  }

  toggleMoreInfo(job: Job): void {
    this.expandedJobIds.update((expandedJobIds) => {
      const next = new Set(expandedJobIds);
      if (next.has(job.id)) {
        next.delete(job.id);
      } else {
        next.add(job.id);
      }
      return next;
    });
  }

  selectJob(job: Job): void {
    this.selectedJob.set(job);
    this.form = {
      title: job.title,
      company: job.company,
      requiredSkills: [...(job.requiredSkills ?? [])],
      minimumExperienceYears: job.minimumExperienceYears,
      educationLevel: job.educationLevel,
      location: job.location,
      department: job.department,
      employmentType: job.employmentType,
      workMode: job.workMode,
      salaryRange: job.salaryRange,
      applicationDeadline: job.applicationDeadline,
      status: job.status
    };
    this.skillsInput = (job.requiredSkills ?? []).join(', ');
    this.saveError.set('');
    this.saveSuccess.set('');
  }

  saveSelectedJob(): void {
    const selected = this.selectedJob();
    if (!selected) return;

    this.saveError.set('');
    this.saveSuccess.set('');

    if (!this.form.title.trim() || !this.form.company.trim() || this.parsedSkills.length === 0) {
      this.saveError.set('Job title, company, and required skills are required.');
      return;
    }

    this.isSaving.set(true);
    const payload = { ...this.form, requiredSkills: this.parsedSkills };

    this.jobService.updateJob(selected.id, payload).subscribe({
      next: (updatedJob) => {
        this.jobs.update((jobs) => jobs.map((job) => job.id === updatedJob.id ? updatedJob : job));
        this.selectedJob.set(updatedJob);
        this.form = { ...payload };
        this.skillsInput = updatedJob.requiredSkills.join(', ');
        this.saveSuccess.set('Job updated.');
        this.isSaving.set(false);
      },
      error: (err) => {
        this.saveError.set(err.error?.message ?? 'Failed to update this job.');
        this.isSaving.set(false);
      }
    });
  }

  statusTone(status: string | null | undefined): string {
    const value = (status || 'Open').toLowerCase();
    if (value.includes('review')) {
      return 'border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]';
    }
    if (value.includes('closed')) {
      return 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]';
    }
    return 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]';
  }

  isSelected(job: Job): boolean {
    return this.selectedJob()?.id === job.id;
  }

  private emptyForm(): CreateJobPayload {
    return {
      title: '',
      company: '',
      requiredSkills: [],
      minimumExperienceYears: 0,
      educationLevel: '',
      location: '',
      department: '',
      employmentType: '',
      workMode: '',
      salaryRange: '',
      applicationDeadline: null,
      status: 'Open'
    };
  }
}
