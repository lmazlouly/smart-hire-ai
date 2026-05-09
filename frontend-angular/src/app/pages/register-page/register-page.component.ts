import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-page.component.html'
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);

  fullName = '';
  email = '';
  password = '';
  role: 'CANDIDATE' | 'RECRUITER' = 'CANDIDATE';
  isSubmitting = false;
  errorMessage = '';

  submit(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService.register({
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.authService.redirectByRole();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message ?? 'Unable to create account right now.';
      }
    });
  }
}
