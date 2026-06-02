package com.smarthireai.dto;

import java.util.List;

public record CandidateProfileResponse(
        Long id,
        String fullName,
        String email,
        List<String> skills,
        Integer experienceYears,
        String educationLevel
) {
}
