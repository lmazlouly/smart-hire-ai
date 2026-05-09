import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-candidate-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-dashboard-page.component.html'
})
export class CandidateDashboardPageComponent {
  private readonly authService = inject(AuthService);

  readonly recommendations = ['Improve Docker fundamentals', 'Complete Kubernetes basics', 'Review SQL optimization'];

  get fullName(): string {
    return this.authService.getFullName();
  }

  logout(): void {
    this.authService.logout();
  }
}
