package com.smarthireai.dto;

import java.util.List;

public record TopCandidateResponse(
        Long candidateId,
        String fullName,
        String email,
        Double semanticScore,
        Integer matchPercentage,
        List<String> skills,
        List<String> sharedSkills,
        List<String> missingSkills,
        Integer experienceYears,
        String educationLevel,
        String explanation
) {
}
