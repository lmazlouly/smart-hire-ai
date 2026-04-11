package com.smarthireai.entity;

import java.util.List;

public record Job(
        Long id,
        String title,
        String company,
        List<String> requiredSkills,
        Integer minimumExperienceYears,
        String educationLevel
) {
}
