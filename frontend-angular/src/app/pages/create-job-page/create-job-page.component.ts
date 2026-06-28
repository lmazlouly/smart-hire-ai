import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AiJobDraftService, JobDraft } from '../../services/ai-job-draft.service';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-create-job-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-job-page.component.html'
})
export class CreateJobPageComponent {
  private readonly jobService = inject(JobService);
  private readonly aiJobDraftService = inject(AiJobDraftService);
  private readonly router = inject(Router);

  title = '';
  company = '';
  location = '';
  department = '';
  employmentType = 'Full-time';
  workMode = 'Hybrid';
  salaryRange = '';
  applicationDeadline = '';
  status = 'Open';
  skillsInput = '';
  minimumExperienceYears: number | null = null;
  educationLevel = 'Bachelor';
  chatInput = '';

  isSubmitting = signal(false);
  isGeneratingDraft = signal(false);
  error = signal('');
  success = signal(false);
  showCreationChoice = signal(true);
  creationMode = signal<'form' | 'chat' | null>(null);
  chatMessages = signal([
    {
      role: 'assistant',
      text: 'Hi, I can help you shape a job post. Tell me the role, company, location, must-have skills, seniority, salary, and deadline. I will fill the form for you to review.'
    }
  ]);

  readonly educationOptions = ['None', 'High School', 'Associate', 'Bachelor', 'Master', 'PhD'];
  readonly employmentTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  readonly workModeOptions = ['On-site', 'Hybrid', 'Remote'];
  readonly statusOptions = ['Open', 'Draft', 'Paused'];

  get parsedSkills(): string[] {
    return this.skillsInput.split(',').map((skill) => skill.trim()).filter((skill) => skill.length > 0);
  }

  useForm(): void {
    this.creationMode.set('form');
    this.showCreationChoice.set(false);
  }

  useChatbot(): void {
    this.creationMode.set('chat');
    this.showCreationChoice.set(false);
  }

  reopenChoice(): void {
    this.showCreationChoice.set(true);
  }

  sendChatMessage(): void {
    const text = this.chatInput.trim();
    if (!text) {
      return;
    }

    this.chatMessages.update((messages) => [
      ...messages,
      { role: 'recruiter', text },
      { role: 'assistant', text: 'Generating a structured draft now...' }
    ]);
    this.chatInput = '';
    this.error.set('');
    this.isGeneratingDraft.set(true);

    this.aiJobDraftService.generateDraft(text)
      .pipe(finalize(() => this.isGeneratingDraft.set(false)))
      .subscribe({
        next: (draft) => {
          this.applyDraft(draft);
          this.chatMessages.update((messages) => [
            ...messages.slice(0, -1),
            {
              role: 'assistant',
              text: 'Done. I filled the job form below. Review the details, adjust anything you want, then post it.'
            }
          ]);
        },
        error: (err) => {
          const message = err.error?.detail ?? err.error?.message ?? 'I could not generate the job draft. Make sure the AI service is running and OPENAI_API_KEY is configured.';
          this.error.set(message);
          this.chatMessages.update((messages) => [
            ...messages.slice(0, -1),
            { role: 'assistant', text: message }
          ]);
        }
      });
  }

  private applyDraft(draft: JobDraft): void {
    this.title = draft.title || this.title;
    this.company = draft.company || this.company;
    this.location = draft.location || this.location;
    this.department = draft.department || this.department;
    this.employmentType = draft.employmentType || this.employmentType;
    this.workMode = draft.workMode || this.workMode;
    this.salaryRange = draft.salaryRange || this.salaryRange;
    this.applicationDeadline = draft.applicationDeadline || '';
    this.status = draft.status || this.status;
    this.skillsInput = draft.requiredSkills?.join(', ') || this.skillsInput;
    this.minimumExperienceYears = draft.minimumExperienceYears ?? this.minimumExperienceYears;
    this.educationLevel = draft.educationLevel || this.educationLevel;
  }

  submit(): void {
    this.error.set('');
    if (!this.title.trim() || !this.company.trim() || this.parsedSkills.length === 0) {
      this.error.set('Job title, company, and at least one required skill are required.');
      return;
    }

    this.isSubmitting.set(true);
    const payload = {
      title: this.title.trim(),
      company: this.company.trim(),
      requiredSkills: this.parsedSkills,
      minimumExperienceYears: this.minimumExperienceYears ?? 0,
      educationLevel: this.educationLevel,
      location: this.location.trim(),
      department: this.department.trim(),
      employmentType: this.employmentType,
      workMode: this.workMode,
      salaryRange: this.salaryRange.trim(),
      applicationDeadline: this.applicationDeadline || null,
      status: this.status
    };

    this.jobService.createJob(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/recruiter/jobs']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.message ?? 'Failed to create job. Please try again.');
      }
    });
  }
}
