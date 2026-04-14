package com.smarthireai.service;

import com.smarthireai.dto.CreateCandidateRequest;
import com.smarthireai.entity.Candidate;
import com.smarthireai.entity.User;
import com.smarthireai.repository.CandidateRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;

    public CandidateService(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
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
}
