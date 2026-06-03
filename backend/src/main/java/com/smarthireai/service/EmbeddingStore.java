package com.smarthireai.service;

import java.util.List;

public interface EmbeddingStore {

    void saveJobEmbedding(Long jobId, List<Double> embedding);

    void saveCandidateEmbedding(Long candidateId, List<Double> embedding);
}
