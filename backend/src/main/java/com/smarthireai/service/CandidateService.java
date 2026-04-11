package com.smarthireai.service;

import com.smarthireai.dto.CreateCandidateRequest;
import com.smarthireai.entity.Candidate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class CandidateService {

    private final List<Candidate> candidates = new ArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public List<Candidate> getAllCandidates() {
        return candidates;
    }

    public Candidate createCandidate(CreateCandidateRequest request) {
        Candidate candidate = new Candidate(
                idCounter.getAndIncrement(),
                request.fullName(),
                request.email(),
                request.skills(),
                request.experienceYears(),
                request.educationLevel()
        );

        candidates.add(candidate);
        return candidate;
    }
}
