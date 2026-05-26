package com.smarthireai.service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class PgVectorEmbeddingStore implements EmbeddingStore {

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

    private boolean isPostgres() {
        return datasourceUrl != null && datasourceUrl.startsWith("jdbc:postgresql:");
    }

    private String toVectorLiteral(List<Double> embedding) {
        return embedding.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(",", "[", "]"));
    }
}
