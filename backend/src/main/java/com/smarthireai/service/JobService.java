package com.smarthireai.service;

import com.smarthireai.dto.CreateJobRequest;
import com.smarthireai.dto.TopCandidateResponse;
import com.smarthireai.entity.Candidate;
import com.smarthireai.entity.Job;
import com.smarthireai.entity.User;
import com.smarthireai.repository.CandidateRepository;
import com.smarthireai.repository.JobRepository;
import com.smarthireai.repository.UserRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final EmbeddingClient embeddingClient;
    private final EmbeddingStore embeddingStore;
    private final CandidateRankingStore candidateRankingStore;

    public JobService(
            JobRepository jobRepository,
            UserRepository userRepository,
            CandidateRepository candidateRepository,
            EmbeddingClient embeddingClient,
            EmbeddingStore embeddingStore,
            CandidateRankingStore candidateRankingStore
    ) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.embeddingClient = embeddingClient;
        this.embeddingStore = embeddingStore;
        this.candidateRankingStore = candidateRankingStore;
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

    @Transactional(readOnly = true)
    public List<TopCandidateResponse> getTopCandidates(Long jobId, Integer limit) {
        Job job = getMyJob(jobId);
        int safeLimit = limit == null ? 10 : Math.max(1, Math.min(limit, 50));

        List<CandidateRankingStore.CandidateMatchScore> rankedScores =
                candidateRankingStore.findTopCandidatesForJob(job.getId(), safeLimit);

        Map<Long, Double> scoresByCandidateId = new HashMap<>();
        List<Long> candidateIds = new ArrayList<>();
        for (CandidateRankingStore.CandidateMatchScore rankedScore : rankedScores) {
            if (rankedScore.candidateId() != null) {
                scoresByCandidateId.put(rankedScore.candidateId(), rankedScore.score());
                candidateIds.add(rankedScore.candidateId());
            }
        }

        Map<Long, Candidate> candidatesById = new HashMap<>();
        candidateRepository.findAllById(candidateIds)
                .forEach(candidate -> candidatesById.put(candidate.getId(), candidate));

        return candidateIds.stream()
                .map(candidatesById::get)
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble((Candidate candidate) -> scoresByCandidateId.getOrDefault(candidate.getId(), 0.0)).reversed())
                .map(candidate -> buildTopCandidateResponse(job, candidate, scoresByCandidateId.getOrDefault(candidate.getId(), 0.0)))
                .toList();
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

    private TopCandidateResponse buildTopCandidateResponse(Job job, Candidate candidate, double score) {
        List<String> candidateSkills = candidate.getSkills() == null ? List.of() : new ArrayList<>(candidate.getSkills());
        List<String> requiredSkills = job.getRequiredSkills() == null ? List.of() : job.getRequiredSkills();
        List<String> sharedSkills = findSharedSkills(requiredSkills, candidateSkills);
        List<String> missingSkills = findMissingSkills(requiredSkills, candidateSkills);
        int matchPercentage = (int) Math.round(score * 100);

        return new TopCandidateResponse(
                candidate.getId(),
                candidate.getFullName(),
                candidate.getEmail(),
                Math.round(score * 1000.0) / 10.0,
                matchPercentage,
                candidateSkills,
                sharedSkills,
                missingSkills,
                candidate.getExperienceYears(),
                candidate.getEducationLevel(),
                buildExplanation(score, sharedSkills, missingSkills)
        );
    }

    private List<String> findSharedSkills(List<String> requiredSkills, List<String> candidateSkills) {
        Map<String, String> candidateSkillsByKey = new HashMap<>();
        for (String skill : candidateSkills) {
            candidateSkillsByKey.put(normalizeSkill(skill), skill);
        }

        return requiredSkills.stream()
                .filter(skill -> candidateSkillsByKey.containsKey(normalizeSkill(skill)))
                .toList();
    }

    private List<String> findMissingSkills(List<String> requiredSkills, List<String> candidateSkills) {
        Map<String, String> candidateSkillsByKey = new HashMap<>();
        for (String skill : candidateSkills) {
            candidateSkillsByKey.put(normalizeSkill(skill), skill);
        }

        return requiredSkills.stream()
                .filter(skill -> !candidateSkillsByKey.containsKey(normalizeSkill(skill)))
                .toList();
    }

    private String normalizeSkill(String skill) {
        return skill == null ? "" : skill.trim().toLowerCase(Locale.ROOT);
    }

    private String buildExplanation(double score, List<String> sharedSkills, List<String> missingSkills) {
        String strength = score >= 0.8 ? "Strong semantic match" : score >= 0.55 ? "Good semantic match" : "Weak semantic match";
        return strength + " with " + sharedSkills.size() + " exact skill match"
                + (sharedSkills.size() == 1 ? "" : "es")
                + " and " + missingSkills.size() + " missing required skill"
                + (missingSkills.size() == 1 ? "" : "s")
                + ".";
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
