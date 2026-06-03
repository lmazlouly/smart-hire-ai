package com.smarthireai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record CvParseResult(
        List<String> skills,
        @JsonProperty("experience_years")
        Integer experienceYears,
        @JsonProperty("education_level")
        String educationLevel
) {
}
