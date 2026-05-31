package com.smarthireai.service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class PgVectorEmbeddingStore implements EmbeddingStore, CandidateRankingStore {

    private final JdbcTemplate jdbcTemplate;
    private final String datasourceUrl;

    public PgVectorEmbeddingStore(
            JdbcTemplate jdbcTemplate,
            @Value("${spring.datasource.url:}") String datasourceUrl
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.datasourceUrl = datasourceUrl;
    }

    @PostConstruct
    void ensureVectorColumnsExist() {
        if (!isPostgres()) {
            return;
        }

        jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS vector");
        jdbcTemplate.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS embedding vector(384)");
        jdbcTemplate.execute("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS embedding vector(384)");
    }

    @Override
    public void saveJobEmbedding(Long jobId, List<Double> embedding) {
        if (!isPostgres() || jobId == null || embedding == null || embedding.isEmpty()) {
            return;
        }

        jdbcTemplate.update("UPDATE jobs SET embedding = ?::vector WHERE id = ?", toVectorLiteral(embedding), jobId);
    }

    @Override
    public void saveCandidateEmbedding(Long candidateId, List<Double> embedding) {
        if (!isPostgres() || candidateId == null || embedding == null || embedding.isEmpty()) {
            return;
        }

        jdbcTemplate.update("UPDATE candidates SET embedding = ?::vector WHERE id = ?", toVectorLiteral(embedding), candidateId);
    }

    @Override
    public List<CandidateMatchScore> findTopCandidatesForJob(Long jobId, int limit) {
        if (!isPostgres() || jobId == null) {
            return List.of();
        }

        int safeLimit = Math.max(1, Math.min(limit, 50));
        return jdbcTemplate.query(
                """
                        SELECT c.id AS candidate_id,
                               1 - (c.embedding <=> j.embedding) AS score
                        FROM candidates c
                        JOIN jobs j ON j.id = ?
                        WHERE c.embedding IS NOT NULL
                          AND j.embedding IS NOT NULL
                        ORDER BY c.embedding <=> j.embedding
                        LIMIT ?
                        """,
                (rs, rowNum) -> new CandidateMatchScore(
                        rs.getLong("candidate_id"),
                        rs.getDouble("score")
                ),
                jobId,
                safeLimit
        );
    }

    private boolean isPostgres() {
        return datasourceUrl != null && datasourceUrl.startsWith("jdbc:postgresql:");
    }

    private String toVectorLiteral(List<Double> embedding) {
        return embedding.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(",", "[", "]"));
    }
}
