import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('does not create a logged-in session when storage is empty', () => {
    const service = TestBed.inject(AuthService);

    expect(service.getToken()).toBeNull();
    expect(service.getRole()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
});
