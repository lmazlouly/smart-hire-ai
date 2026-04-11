package com.smarthireai.entity;

import java.util.List;

public record Candidate(
        Long id,
        String fullName,
        String email,
        List<String> skills,
        Integer experienceYears,
        String educationLevel
) {
}
