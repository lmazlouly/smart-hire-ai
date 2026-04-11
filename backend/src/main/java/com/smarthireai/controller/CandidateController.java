package com.smarthireai.controller;

import com.smarthireai.dto.CreateCandidateRequest;
import com.smarthireai.entity.Candidate;
import com.smarthireai.service.CandidateService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping
    public List<Candidate> getCandidates() {
        return candidateService.getAllCandidates();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Candidate createCandidate(@RequestBody CreateCandidateRequest request) {
        return candidateService.createCandidate(request);
    }
}
