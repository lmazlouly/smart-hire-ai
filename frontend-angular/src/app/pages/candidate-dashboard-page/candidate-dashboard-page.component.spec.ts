import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CandidateDashboardPageComponent } from './candidate-dashboard-page.component';
import { AuthService } from '../../services/auth.service';
import { CandidateProfileService } from '../../services/candidate-profile.service';
import { CvService } from '../../services/cv.service';
import { JobService } from '../../services/job.service';

describe('CandidateDashboardPageComponent', () => {
  let fixture: ComponentFixture<CandidateDashboardPageComponent>;
  let component: CandidateDashboardPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateDashboardPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { getFullName: () => 'Soufiane Meskine', logout: () => undefined } },
        { provide: JobService, useValue: { getJobs: () => of([]) } },
        { provide: CvService, useValue: { getCvVersions: () => of([]), uploadCv: () => of(null), extractSkills: () => of(null) } },
        { provide: CandidateProfileService, useValue: { getMyProfile: () => of(null) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateDashboardPageComponent);
    component = fixture.componentInstance;
  });

  it('marks extraction as ready when the active CV is parsed and skills exist', () => {
    component.cvVersions.set([
      {
        id: 1,
        fileName: 'soufiane-cv.pdf',
        fileUrl: '/cv.pdf',
        fileType: 'application/pdf',
        fileSize: 1200000,
        versionNumber: 2,
        active: true,
        uploadedAt: '2026-05-25T14:31:00Z',
        parseStatus: 'PARSED',
        parsedAt: '2026-05-25T14:32:00Z'
      }
    ]);
    component.profile.set({
      id: 5,
      fullName: 'Soufiane Meskine',
      email: 'soufiane@example.com',
      skills: ['Java', 'Spring Boot'],
      experienceYears: 3.2,
      educationLevel: 'Bachelor'
    });

    expect(component.extractionProgress).toBe(100);
    expect(component.extractionStateLabel).toBe('Ready for matching');
  });

  it('shows the first eight extracted skills and counts the hidden ones', () => {
    component.profile.set({
      id: 5,
      fullName: 'Soufiane Meskine',
      email: 'soufiane@example.com',
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Angular', 'Docker', 'Python', 'REST APIs', 'Git', 'Linux'],
      experienceYears: 3,
      educationLevel: 'Bachelor'
    });

    expect(component.featuredSkills).toEqual(['Java', 'Spring Boot', 'PostgreSQL', 'Angular', 'Docker', 'Python', 'REST APIs', 'Git']);
    expect(component.hiddenSkillsCount).toBe(1);
  });
});
