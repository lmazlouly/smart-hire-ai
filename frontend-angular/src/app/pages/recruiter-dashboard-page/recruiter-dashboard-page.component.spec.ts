import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { RecruiterDashboardPageComponent } from './recruiter-dashboard-page.component';
import { AuthService } from '../../services/auth.service';
import { JobService } from '../../services/job.service';

describe('RecruiterDashboardPageComponent', () => {
  let fixture: ComponentFixture<RecruiterDashboardPageComponent>;
  let component: RecruiterDashboardPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterDashboardPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { getFullName: () => 'Maissae Belkhir', logout: () => undefined } },
        { provide: JobService, useValue: { getMyJobs: () => of([]), updateJob: () => of(null) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterDashboardPageComponent);
    component = fixture.componentInstance;
  });

  it('filters jobs by title, company, location, and skills', () => {
    component.jobs.set([
      {
        id: 1,
        title: 'Backend Java Engineer',
        company: 'Smart Hire AI',
        requiredSkills: ['Java', 'Spring Boot'],
        minimumExperienceYears: 3,
        educationLevel: 'Bachelor',
        location: 'Casablanca',
        department: 'Engineering',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        salaryRange: 'MAD 18k - 28k',
        applicationDeadline: '',
        status: 'Open'
      },
      {
        id: 2,
        title: 'Frontend Angular Developer',
        company: 'Smart Hire AI',
        requiredSkills: ['Angular', 'TypeScript'],
        minimumExperienceYears: 2,
        educationLevel: 'Bachelor',
        location: 'Rabat',
        department: 'Engineering',
        employmentType: 'Full-time',
        workMode: 'Remote',
        salaryRange: 'MAD 15k - 24k',
        applicationDeadline: '',
        status: 'Open'
      }
    ]);
    component.searchTerm.set('spring');

    expect(component.filteredJobs().map((job) => job.id)).toEqual([1]);
  });

  it('creates an editable copy when a job is selected', () => {
    component.selectJob({
      id: 1,
      title: 'Backend Java Engineer',
      company: 'Smart Hire AI',
      requiredSkills: ['Java', 'Spring Boot'],
      minimumExperienceYears: 3,
      educationLevel: 'Bachelor',
      location: 'Casablanca',
      department: 'Engineering',
      employmentType: 'Full-time',
      workMode: 'Hybrid',
      salaryRange: 'MAD 18k - 28k',
      applicationDeadline: '',
      status: 'Open'
    });

    component.form.title = 'Changed';

    expect(component.selectedJob()?.title).toBe('Backend Java Engineer');
    expect(component.skillsInput).toBe('Java, Spring Boot');
  });
});
