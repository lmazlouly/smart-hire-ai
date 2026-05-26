package com.smarthireai.service;

import com.smarthireai.dto.CvParseResult;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class AiCvParsingClient implements CvParsingClient {

    private final RestClient restClient;

    public AiCvParsingClient(
            @Value("${ai.service.base-url:http://localhost:8000}") String aiServiceBaseUrl
    ) {
        this.restClient = RestClient.builder().baseUrl(aiServiceBaseUrl).build();
    }

    @Override
    public CvParseResult parse(String fileName, byte[] content, String contentType) throws IOException {
        String uploadFileName = fileName == null || fileName.isBlank() ? "cv.pdf" : fileName;
        ByteArrayResource resource = new ByteArrayResource(content) {
            @Override
            public String getFilename() {
                return uploadFileName;
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);

        Map<String, Object> response = restClient.post()
                .uri("/parse-cv")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(Map.class);

        return new CvParseResult(
                asStringList(response.get("skills")),
                asInteger(response.get("experience_years")),
                asString(response.get("education_level"))
        );
    }

    private List<String> asStringList(Object value) {
        if (value instanceof List<?> values) {
            return values.stream().map(String::valueOf).toList();
        }
        return List.of();
    }

    private Integer asInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Integer.parseInt(text);
        }
        return null;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
