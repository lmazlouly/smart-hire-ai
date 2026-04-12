package com.smarthireai.service;

import com.smarthireai.dto.CreateCandidateRequest;
import com.smarthireai.entity.Candidate;
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
        Candidate candidate = new Candidate(
                request.fullName(),
                request.email(),
                new ArrayList<>(request.skills() == null ? List.of() : request.skills()),
                request.experienceYears(),
                request.educationLevel()
        );

        return candidateRepository.save(candidate);
    }
}
