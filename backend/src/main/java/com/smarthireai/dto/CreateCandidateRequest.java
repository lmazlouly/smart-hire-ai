package com.smarthireai.dto;

import java.util.List;

public record CreateCandidateRequest(
        String fullName,
        String email,
        List<String> skills,
        Integer experienceYears,
        String educationLevel
) {
}
