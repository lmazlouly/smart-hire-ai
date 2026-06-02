import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CreateJobPayload, Job, JobService, TopCandidate } from '../../services/job.service';

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
  topCandidates = signal<TopCandidate[]>([]);
  isLoadingTopCandidates = signal(false);
  topCandidatesError = signal('');
  isHelpOpen = signal(false);
  visibleCandidateCount = signal(3);
  candidateFilter = signal<'all' | 'strong' | 'skills' | 'review'>('all');
  skillsInput = '';
  readonly matchingSteps = [
    { title: 'Read CVs', detail: 'The platform reviews uploaded CVs and profile details.' },
    { title: 'Compare fit', detail: 'It compares skills, experience, education, and job requirements.' },
    { title: 'Rank candidates', detail: 'The strongest matches appear first for faster review.' }
  ];
  readonly candidateFilters = [
    { value: 'all' as const, label: 'All' },
    { value: 'strong' as const, label: 'Strong matches' },
    { value: 'skills' as const, label: 'Has skill overlap' },
    { value: 'review' as const, label: 'Needs review' }
  ];
  readonly displayLimitOptions = [3, 5, 10];

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
        this.loadTopCandidates(updatedJob.id);
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
        this.loadTopCandidates(job.id);
      },
      error: () => {
        this.error.set('Failed to load this job.');
        this.isLoading.set(false);
      }
    });
  }

  refreshTopCandidates(): void {
    const job = this.job();
    if (!job) return;
    this.loadTopCandidates(job.id);
  }

  setCandidateFilter(filter: 'all' | 'strong' | 'skills' | 'review'): void {
    this.candidateFilter.set(filter);
    this.visibleCandidateCount.set(3);
  }

  setVisibleCandidateCount(count: number): void {
    this.visibleCandidateCount.set(count);
  }

  showMoreCandidates(): void {
    this.visibleCandidateCount.update((count) => Math.min(count + 3, this.filteredCandidates().length));
  }

  filteredCandidates(): TopCandidate[] {
    const filter = this.candidateFilter();

    if (filter === 'strong') {
      return this.topCandidates().filter((candidate) => (candidate.matchPercentage ?? 0) >= 70);
    }
    if (filter === 'skills') {
      return this.topCandidates().filter((candidate) => (candidate.sharedSkills?.length ?? 0) > 0);
    }
    if (filter === 'review') {
      return this.topCandidates().filter((candidate) => (candidate.matchPercentage ?? 0) < 70);
    }

    return this.topCandidates();
  }

  visibleCandidates(): TopCandidate[] {
    return this.filteredCandidates().slice(0, this.visibleCandidateCount());
  }

  get hasMoreCandidates(): boolean {
    return this.visibleCandidates().length < this.filteredCandidates().length;
  }

  get rankedTotalLabel(): string {
    const filtered = this.filteredCandidates().length;
    const total = this.topCandidates().length;
    if (filtered === total) {
      return `${total} ranked total`;
    }
    return `${filtered} shown by filter · ${total} ranked total`;
  }

  scoreWidth(candidate: TopCandidate): string {
    return `${Math.max(4, Math.min(candidate.matchPercentage ?? 0, 100))}%`;
  }

  scoreLabel(candidate: TopCandidate): string {
    const score = candidate.matchPercentage ?? 0;
    if (score >= 85) return 'Excellent match';
    if (score >= 70) return 'Strong match';
    if (score >= 55) return 'Good match';
    return 'Review fit';
  }

  scoreTone(candidate: TopCandidate): string {
    const score = candidate.matchPercentage ?? 0;
    if (score >= 85) return 'text-[#087443]';
    if (score >= 70) return 'text-[#2563EB]';
    if (score >= 55) return 'text-[#A15C07]';
    return 'text-[#9F1239]';
  }

  visibleSkills(candidate: TopCandidate): string[] {
    return (candidate.skills ?? []).slice(0, 4);
  }

  hiddenSkillsCount(candidate: TopCandidate): number {
    return Math.max(0, (candidate.skills?.length ?? 0) - this.visibleSkills(candidate).length);
  }

  private loadTopCandidates(jobId: number): void {
    this.isLoadingTopCandidates.set(true);
    this.topCandidatesError.set('');

    this.jobService.getTopCandidates(jobId).subscribe({
      next: (candidates) => {
        this.topCandidates.set(candidates);
        this.visibleCandidateCount.set(3);
        this.isLoadingTopCandidates.set(false);
      },
      error: (err) => {
        this.topCandidatesError.set(err.error?.message ?? 'Failed to load top candidates.');
        this.isLoadingTopCandidates.set(false);
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
