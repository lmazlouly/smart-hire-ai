import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-page.component.html'
})
export class ProfilePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  profileForm: FormGroup;
  isEditing = false;
  isSaving = false;

  constructor() {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      bio: ['', [Validators.maxLength(500)]],
      linkedin: [''],
      github: ['']
    });

    this.loadProfile();
  }

  loadProfile(): void {
    // TODO: Load from API
    this.profileForm.patchValue({
      fullName: this.authService.getFullName() || 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8900',
      location: 'San Francisco, CA',
      bio: 'Software developer with 5 years of experience in full-stack development.',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe'
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.profileForm.reset(this.profileForm.value);
    }
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSaving = true;
    // TODO: Save to API
    setTimeout(() => {
      this.isSaving = false;
      this.isEditing = false;
    }, 1000);
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.loadProfile();
  }

  goBack(): void {
    this.router.navigate(['/candidate']);
  }
}
