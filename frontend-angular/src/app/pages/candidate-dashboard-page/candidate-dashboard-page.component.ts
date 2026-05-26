import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CandidateProfile, CandidateProfileService } from '../../services/candidate-profile.service';
import { CvService, CvVersion } from '../../services/cv.service';
import { Job, JobService } from '../../services/job.service';

@Component({
  selector: 'app-candidate-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './candidate-dashboard-page.component.html'
})
export class CandidateDashboardPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly jobService = inject(JobService);
  private readonly cvService = inject(CvService);
  private readonly candidateProfileService = inject(CandidateProfileService);

  jobs = signal<Job[]>([]);
  isLoadingJobs = signal(true);
  jobsError = signal('');
  profile = signal<CandidateProfile | null>(null);
  isLoadingProfile = signal(true);
  isExtractingSkills = signal(false);
  cvVersions = signal<CvVersion[]>([]);
  isLoadingCvs = signal(true);
  isUploadingCv = signal(false);
  selectedCvFile = signal<File | null>(null);
  cvError = signal('');

  readonly recommendations = ['Improve Docker fundamentals', 'Complete Kubernetes basics', 'Review SQL optimization'];

  get fullName(): string {
    return this.authService.getFullName();
  }

  getInitials(): string {
    const name = this.fullName?.trim();
    if (!name) {
      return '?';
    }

    return name
      .split(' ')
      .filter((part) => part.length > 0)
      .map((part) => part[0])
      .join('');
  }

  ngOnInit(): void {
    this.jobService.getJobs().subscribe({
      next: (data) => {
        this.jobs.set(data.slice(0, 3));
        this.isLoadingJobs.set(false);
      },
      error: () => {
        this.jobsError.set('Failed to load recommended jobs.');
        this.isLoadingJobs.set(false);
      }
    });

    this.loadCvVersions();
    this.loadProfile();
  }

  logout(): void {
    this.authService.logout();
  }

  get currentCv(): CvVersion | null {
    return this.cvVersions().find((version) => version.active) ?? this.cvVersions()[0] ?? null;
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.cvError.set('');
    this.selectedCvFile.set(file);
  }

  uploadSelectedCv(): void {
    const file = this.selectedCvFile();

    if (!file) {
      this.cvError.set('Choose a PDF, DOC, or DOCX file first.');
      return;
    }

    this.isUploadingCv.set(true);
    this.cvError.set('');

    this.cvService.uploadCv(file).subscribe({
      next: (cvVersion) => {
        this.cvVersions.update((versions) => [
          cvVersion,
          ...versions.map((version) => ({ ...version, active: false }))
        ]);
        this.selectedCvFile.set(null);
        this.isUploadingCv.set(false);
        this.loadProfile();
      },
      error: (err) => {
        this.cvError.set(err.error?.message ?? 'Failed to upload CV. Please try again.');
        this.isUploadingCv.set(false);
      }
    });
  }

  generateSkills(): void {
    const cv = this.currentCv;

    if (!cv) {
      this.cvError.set('Upload a PDF CV before generating skills.');
      return;
    }

    this.isExtractingSkills.set(true);
    this.cvError.set('');

    this.cvService.extractSkills(cv.id).subscribe({
      next: (updatedCv) => {
        this.cvVersions.update((versions) =>
          versions.map((version) => version.id === updatedCv.id ? updatedCv : version)
        );
        this.isExtractingSkills.set(false);
        this.loadProfile();
      },
      error: (err) => {
        this.cvError.set(err.error?.message ?? 'Failed to generate skills from this CV.');
        this.isExtractingSkills.set(false);
      }
    });
  }

  get skills(): string[] {
    return this.profile()?.skills ?? [];
  }

  get hasSkills(): boolean {
    return this.skills.length > 0;
  }

  get profileCompleteness(): number {
    let score = 20;
    if (this.currentCv) {
      score += 30;
    }
    if (this.hasSkills) {
      score += 35;
    }
    if (this.profile()?.experienceYears !== null && this.profile()?.experienceYears !== undefined) {
      score += 15;
    }
    return Math.min(score, 100);
  }

  getSkillTone(index: number): string {
    const tones = [
      'border-[#CDEFE2] bg-[#F0FDF7] text-[#087443]',
      'border-[#DDE7FF] bg-[#F5F8FF] text-[#335CBE]',
      'border-[#F7DFC2] bg-[#FFF8ED] text-[#A05A00]',
      'border-[#F2D5EA] bg-[#FFF4FB] text-[#9B2C79]'
    ];
    return tones[index % tones.length];
  }

  formatFileSize(size: number): string {
    if (size < 1024 * 1024) {
      return `${Math.max(1, Math.round(size / 1024))} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  private loadCvVersions(): void {
    this.cvService.getCvVersions().subscribe({
      next: (versions) => {
        this.cvVersions.set(versions);
        this.isLoadingCvs.set(false);
      },
      error: () => {
        this.cvError.set('Failed to load CV versions.');
        this.isLoadingCvs.set(false);
      }
    });
  }

  private loadProfile(): void {
    this.candidateProfileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoadingProfile.set(false);
      },
      error: () => {
        this.isLoadingProfile.set(false);
      }
    });
  }
}
