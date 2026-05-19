package com.smarthireai.service;

import com.smarthireai.dto.CreateJobRequest;
import com.smarthireai.entity.AppUser;
import com.smarthireai.entity.Job;
import com.smarthireai.entity.Role;
import com.smarthireai.repository.AppUserRepository;
import com.smarthireai.repository.JobRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final AppUserRepository appUserRepository;

    public JobService(JobRepository jobRepository, AppUserRepository appUserRepository) {
        this.jobRepository = jobRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job createJob(CreateJobRequest request) {
        AppUser recruiter = getAuthenticatedRecruiter();
        
        Job job = new Job(
                recruiter,
                request.title(),
                request.company(),
                new ArrayList<>(request.requiredSkills() == null ? List.of() : request.requiredSkills()),
                request.minimumExperienceYears(),
                request.educationLevel()
        );

        return jobRepository.save(job);
    }

    private AppUser getAuthenticatedRecruiter() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        String email = authentication.getName();

        AppUser recruiter = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiter role is required");
        }

        return recruiter;
    }
}
