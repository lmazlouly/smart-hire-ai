package com.smarthireai.service;

import com.smarthireai.dto.CreateJobRequest;
import com.smarthireai.entity.Job;
import com.smarthireai.entity.User;
import com.smarthireai.repository.JobRepository;
import com.smarthireai.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final EmbeddingClient embeddingClient;
    private final EmbeddingStore embeddingStore;

    public JobService(
            JobRepository jobRepository,
            UserRepository userRepository,
            EmbeddingClient embeddingClient,
            EmbeddingStore embeddingStore
    ) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.embeddingClient = embeddingClient;
        this.embeddingStore = embeddingStore;
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public List<Job> getMyJobs() {
        User recruiter = getAuthenticatedRecruiter();
        return jobRepository.findByRecruiterOrderByIdDesc(recruiter);
    }

    public Job getMyJob(Long jobId) {
        User recruiter = getAuthenticatedRecruiter();
        return jobRepository.findByIdAndRecruiter(jobId, recruiter)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job was not found"));
    }

    public Job createJob(CreateJobRequest request) {
        User recruiter = getAuthenticatedRecruiter();
        
        Job job = new Job(
                recruiter,
                request.title(),
                request.company(),
                new ArrayList<>(request.requiredSkills() == null ? List.of() : request.requiredSkills()),
                request.minimumExperienceYears(),
                request.educationLevel(),
                request.location(),
                request.department(),
                request.employmentType(),
                request.workMode(),
                request.salaryRange(),
                request.applicationDeadline(),
                request.status() == null || request.status().isBlank() ? "Open" : request.status()
        );

        refreshJobEmbedding(job);
        Job savedJob = jobRepository.save(job);
        saveJobVector(savedJob);
        return savedJob;
    }

    public Job updateJob(Long jobId, CreateJobRequest request) {
        Job job = getMyJob(jobId);

        job.setTitle(request.title());
        job.setCompany(request.company());
        job.setRequiredSkills(new ArrayList<>(request.requiredSkills() == null ? List.of() : request.requiredSkills()));
        job.setMinimumExperienceYears(request.minimumExperienceYears());
        job.setEducationLevel(request.educationLevel());
        job.setLocation(request.location());
        job.setDepartment(request.department());
        job.setEmploymentType(request.employmentType());
        job.setWorkMode(request.workMode());
        job.setSalaryRange(request.salaryRange());
        job.setApplicationDeadline(request.applicationDeadline());
        job.setStatus(request.status() == null || request.status().isBlank() ? "Open" : request.status());

        refreshJobEmbedding(job);
        Job savedJob = jobRepository.save(job);
        saveJobVector(savedJob);
        return savedJob;
    }

    private void refreshJobEmbedding(Job job) {
        job.setEmbeddingText(buildJobEmbeddingText(job));
        job.setEmbeddingUpdatedAt(LocalDateTime.now());
    }

    private void saveJobVector(Job job) {
        try {
            embeddingStore.saveJobEmbedding(job.getId(), embeddingClient.embed(job.getEmbeddingText()));
        } catch (Exception ignored) {
        }
    }

    private String buildJobEmbeddingText(Job job) {
        return String.join("\n",
                "Title: " + nullToEmpty(job.getTitle()),
                "Company: " + nullToEmpty(job.getCompany()),
                "Department: " + nullToEmpty(job.getDepartment()),
                "Location: " + nullToEmpty(job.getLocation()),
                "Employment type: " + nullToEmpty(job.getEmploymentType()),
                "Work mode: " + nullToEmpty(job.getWorkMode()),
                "Required skills: " + String.join(", ", job.getRequiredSkills() == null ? List.of() : job.getRequiredSkills()),
                "Minimum experience years: " + nullToEmpty(job.getMinimumExperienceYears()),
                "Education level: " + nullToEmpty(job.getEducationLevel()),
                "Salary range: " + nullToEmpty(job.getSalaryRange())
        );
    }

    private String nullToEmpty(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private User getAuthenticatedRecruiter() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        String email = authentication.getName();

        User recruiter = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));

        if (recruiter.getRole() != User.UserRole.RECRUITER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiter role is required");
        }

        return recruiter;
    }
}
