package com.smarthireai.service;

import com.smarthireai.dto.CreateCandidateRequest;
import com.smarthireai.dto.CandidateProfileResponse;
import com.smarthireai.entity.Candidate;
import com.smarthireai.entity.User;
import com.smarthireai.repository.CandidateRepository;
import com.smarthireai.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;

    public CandidateService(CandidateRepository candidateRepository, UserRepository userRepository) {
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
    }

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public Candidate createCandidate(CreateCandidateRequest request) {
        // TODO: This needs to be updated to work with authentication
        // For now, creating a placeholder User object
        User tempUser = new User();
        tempUser.setFullName(request.fullName());
        tempUser.setEmail(request.email());
        
        Candidate candidate = new Candidate(
                tempUser,
                new ArrayList<>(request.skills() == null ? List.of() : request.skills()),
                request.experienceYears(),
                request.educationLevel()
        );

        return candidateRepository.save(candidate);
    }

    @Transactional
    public CandidateProfileResponse getMyProfile() {
        User user = getAuthenticatedCandidate();
        Candidate candidate = candidateRepository.findByUser(user)
                .orElseGet(() -> candidateRepository.save(new Candidate(user, new ArrayList<>(), 0, null)));
        return new CandidateProfileResponse(
                candidate.getId(),
                candidate.getFullName(),
                candidate.getEmail(),
                new ArrayList<>(candidate.getSkills()),
                candidate.getExperienceYears(),
                candidate.getEducationLevel()
        );
    }

    private User getAuthenticatedCandidate() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));

        if (user.getRole() != User.UserRole.CANDIDATE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Candidate role is required");
        }

        return user;
    }
}
