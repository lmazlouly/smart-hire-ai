import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cv-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv-page.component.html'
})
export class CvPageComponent {
  private readonly router = inject(Router);

  cvUploaded = false;
  cvFileName = '';
  cvUploadDate: Date | null = null;
  cvStatus = 'pending'; // pending, processing, completed, failed
  uploadProgress = 0;
  isUploading = false;

  // Mock extracted data
  extractedData = {
    skills: ['JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js', 'Python'],
    experience: 5,
    education: 'Bachelor of Science in Computer Science',
    lastUpdated: null as Date | null
  };

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadCV(file);
    }
  }

  uploadCV(file: File): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    this.cvStatus = 'processing';

    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        this.cvUploaded = true;
        this.cvFileName = file.name;
        this.cvUploadDate = new Date();
        this.cvStatus = 'completed';
        this.extractedData.lastUpdated = new Date();
      }
    }, 200);
  }

  deleteCV(): void {
    this.cvUploaded = false;
    this.cvFileName = '';
    this.cvUploadDate = null;
    this.cvStatus = 'pending';
    this.extractedData.lastUpdated = null;
  }

  reprocessCV(): void {
    this.cvStatus = 'processing';
    setTimeout(() => {
      this.cvStatus = 'completed';
      this.extractedData.lastUpdated = new Date();
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/candidate']);
  }
}
