package com.smarthireai.dto;

import java.util.List;

public record EmbeddingResponse(
        String model,
        Integer dimensions,
        List<Double> embedding
) {
}
