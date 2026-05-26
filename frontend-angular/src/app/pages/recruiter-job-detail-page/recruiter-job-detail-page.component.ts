import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CreateJobPayload, Job, JobService } from '../../services/job.service';

@Component({
  selector: 'app-recruiter-job-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recruiter-job-detail-page.component.html'
})
export class RecruiterJobDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly jobService = inject(JobService);

  job = signal<Job | null>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);
  error = signal('');
  success = signal('');
  skillsInput = '';

  form: CreateJobPayload = this.emptyForm();

  ngOnInit(): void {
    this.loadJob();
  }

  get parsedSkills(): string[] {
    return this.skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
  }

  startEditing(): void {
    const job = this.job();
    if (!job) return;

    this.form = {
      title: job.title,
      company: job.company,
      requiredSkills: [...job.requiredSkills],
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
    this.skillsInput = job.requiredSkills.join(', ');
    this.success.set('');
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.success.set('');
    this.error.set('');
  }

  saveJob(): void {
    const job = this.job();
    if (!job) return;

    this.error.set('');
    this.success.set('');

    if (!this.form.title.trim() || !this.form.company.trim() || this.parsedSkills.length === 0) {
      this.error.set('Title, company, and required skills are required.');
      return;
    }

    this.isSaving.set(true);
    const payload = { ...this.form, requiredSkills: this.parsedSkills };

    this.jobService.updateJob(job.id, payload).subscribe({
      next: (updatedJob) => {
        this.job.set(updatedJob);
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.success.set('Job updated.');
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to update this job.');
        this.isSaving.set(false);
      }
    });
  }

  private loadJob(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.jobService.getJob(id).subscribe({
      next: (job) => {
        this.job.set(job);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load this job.');
        this.isLoading.set(false);
      }
    });
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
