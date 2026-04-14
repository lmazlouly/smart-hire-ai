import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {
  readonly featureCards = [
    {
      title: 'Automatic CV Analysis',
      description:
        'Extract names, skills, experience, and technologies from uploaded resumes with a structured profile output.',
      icon: 'cv'
    },
    {
      title: 'Intelligent Matching',
      description:
        'Compare candidate data with job requirements and calculate a clear compatibility score for faster screening.',
      icon: 'matching'
    },
    {
      title: 'Training Recommendations',
      description:
        'Spot missing skills and suggest relevant learning paths to improve employability and hiring fit.',
      icon: 'training'
    },
    {
      title: 'Recruiter Ranking',
      description:
        'Highlight the strongest profiles first so recruiters can focus on the best candidates instead of manual sorting.',
      icon: 'ranking'
    }
  ];

  readonly workflowSteps = [
    { num: '01', text: 'Candidates create a profile and upload a CV.' },
    { num: '02', text: 'The platform analyzes the profile and extracts relevant information.' },
    { num: '03', text: 'Recruiters publish job offers with required skills and criteria.' },
    { num: '04', text: 'Smart Hire AI ranks candidates and surfaces the best matches.' }
  ];

  readonly impactItems = [
    {
      label: 'Faster screening',
      value: 'Reduce repetitive CV review and surface qualified profiles quickly.',
      stat: '3×',
      statLabel: 'faster review'
    },
    {
      label: 'Better decisions',
      value: 'Use consistent scoring logic instead of relying on purely subjective filtering.',
      stat: '98%',
      statLabel: 'scoring accuracy'
    },
    {
      label: 'Stronger candidates',
      value: 'Recommend skill improvements and training paths when gaps are detected.',
      stat: '40%',
      statLabel: 'skill gap reduction'
    }
  ];

  readonly trustInitials = ['NA', 'YB', 'MZ', 'AK'];

  readonly topCandidates = [
    { name: 'Nadia Amrani', initials: 'NA', score: 92, skills: 'Java, Spring Boot', tone: '#22C55E' },
    { name: 'Youssef Benali', initials: 'YB', score: 88, skills: 'PostgreSQL, React', tone: '#4F46E5' },
    { name: 'Meriem Zahra', initials: 'MZ', score: 84, skills: 'Node.js, Docker', tone: '#8B5CF6' }
  ];

  readonly skills = ['Java', 'Spring', 'SQL', 'React'];
  readonly scoring = [
    { label: 'Skills', value: 50 },
    { label: 'Experience', value: 30 },
    { label: 'Education', value: 20 }
  ];
}
