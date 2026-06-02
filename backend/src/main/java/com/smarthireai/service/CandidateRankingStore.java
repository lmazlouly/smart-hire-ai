package com.smarthireai.service;

import java.util.List;

public interface CandidateRankingStore {

    List<CandidateMatchScore> findTopCandidatesForJob(Long jobId, int limit);

    record CandidateMatchScore(Long candidateId, double score) {
    }
}
