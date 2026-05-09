import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recruiter-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-dashboard-page.component.html'
})
export class RecruiterDashboardPageComponent {
  private readonly authService = inject(AuthService);

  readonly topCandidates = [
    { name: 'Nadia Amrani', score: '92%', stack: 'Java, Spring Boot' },
    { name: 'Youssef Benali', score: '88%', stack: 'PostgreSQL, React' },
    { name: 'Meriem Zahra', score: '84%', stack: 'Node.js, Docker' }
  ];

  get fullName(): string {
    return this.authService.getFullName();
  }

  logout(): void {
    this.authService.logout();
  }
}
