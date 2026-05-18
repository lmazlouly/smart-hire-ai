import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  requiredSkills: string[];
  postedDate: Date;
}

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jobs-page.component.html'
})
export class JobsPageComponent {
  private readonly router = inject(Router);

  jobs: Job[] = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      matchScore: 95,
      requiredSkills: ['JavaScript', 'TypeScript', 'Angular', 'React'],
      postedDate: new Date('2024-01-15')
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '$100,000 - $130,000',
      matchScore: 88,
      requiredSkills: ['JavaScript', 'Node.js', 'Python', 'React'],
      postedDate: new Date('2024-01-14')
    },
    {
      id: 3,
      title: 'Software Engineer',
      company: 'BigTech Company',
      location: 'New York, NY',
      salary: '$110,000 - $140,000',
      matchScore: 82,
      requiredSkills: ['Java', 'Spring Boot', 'JavaScript'],
      postedDate: new Date('2024-01-13')
    },
    {
      id: 4,
      title: 'Angular Developer',
      company: 'WebSolutions Ltd',
      location: 'London, UK',
      salary: '£60,000 - £80,000',
      matchScore: 78,
      requiredSkills: ['Angular', 'TypeScript', 'RxJS'],
      postedDate: new Date('2024-01-12')
    },
    {
      id: 5,
      title: 'React Developer',
      company: 'Digital Agency',
      location: 'Remote',
      salary: '$90,000 - $120,000',
      matchScore: 75,
      requiredSkills: ['React', 'TypeScript', 'Redux'],
      postedDate: new Date('2024-01-11')
    }
  ];

  selectedFilter = 'all';
  filters = ['all', 'high-match', 'recent', 'remote'];

  get filteredJobs(): Job[] {
    let filtered = this.jobs;

    if (this.selectedFilter === 'high-match') {
      filtered = filtered.filter(job => job.matchScore >= 85);
    } else if (this.selectedFilter === 'recent') {
      filtered = filtered.filter(job => {
        const daysSincePosted = Math.floor((new Date().getTime() - job.postedDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSincePosted <= 7;
      });
    } else if (this.selectedFilter === 'remote') {
      filtered = filtered.filter(job => job.location.toLowerCase() === 'remote');
    }

    return filtered.sort((a, b) => b.matchScore - a.matchScore);
  }

  getMatchScoreColor(score: number): string {
    if (score >= 90) return 'text-[#10B981]';
    if (score >= 75) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  }

  getMatchScoreBg(score: number): string {
    if (score >= 90) return 'bg-[#10B981]/10';
    if (score >= 75) return 'bg-[#F59E0B]/10';
    return 'bg-[#EF4444]/10';
  }

  applyToJob(jobId: number): void {
    // TODO: Implement job application
    console.log('Applying to job:', jobId);
  }

  viewJobDetails(jobId: number): void {
    // TODO: Navigate to job details page
    console.log('Viewing job details:', jobId);
  }

  goBack(): void {
    this.router.navigate(['/candidate']);
  }
}
