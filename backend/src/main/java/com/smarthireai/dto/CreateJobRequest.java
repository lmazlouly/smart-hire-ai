package com.smarthireai.dto;

import java.util.List;

public record CreateJobRequest(
        String title,
        String company,
        List<String> requiredSkills,
        Integer minimumExperienceYears,
        String educationLevel
) {
}
