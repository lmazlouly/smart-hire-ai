package com.smarthireai.service;

import com.smarthireai.dto.EmbeddingResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AiEmbeddingClient implements EmbeddingClient {

    private final RestClient restClient;

    public AiEmbeddingClient(@Value("${ai.service.base-url:http://localhost:8000}") String aiServiceBaseUrl) {
        this.restClient = RestClient.builder().baseUrl(aiServiceBaseUrl).build();
    }

    @Override
    public List<Double> embed(String text) throws IOException {
        EmbeddingResponse response = restClient.post()
                .uri("/embed")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("text", text == null ? "" : text))
                .retrieve()
                .body(EmbeddingResponse.class);

        return response == null || response.embedding() == null ? List.of() : response.embedding();
    }
}
