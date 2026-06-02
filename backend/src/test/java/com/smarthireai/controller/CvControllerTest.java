package com.smarthireai.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.smarthireai.dto.CvParseResult;
import com.smarthireai.repository.CandidateRepository;
import com.smarthireai.repository.CvVersionRepository;
import com.smarthireai.repository.UserRepository;
import com.smarthireai.service.CvFileDownloader;
import com.smarthireai.service.CvParsingClient;
import com.smarthireai.service.EmbeddingClient;
import com.smarthireai.service.EmbeddingStore;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CvControllerTest {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Autowired
    private CvVersionRepository cvVersionRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private UserRepository userRepository;

    @LocalServerPort
    private int port;

    @AfterEach
    void tearDown() {
        candidateRepository.deleteAll();
        cvVersionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void candidateCanUploadCvVersionsAndListHistory() throws Exception {
        String token = registerAndGetToken(
                "Candidate User",
                "candidate-cv@example.com",
                "CANDIDATE"
        );

        HttpResponse<String> firstUpload = uploadCv(token, "candidate-cv-v1.pdf", "PDF version 1");
        HttpResponse<String> secondUpload = uploadCv(token, "candidate-cv-v2.pdf", "PDF version 2");
        HttpResponse<String> history = get("/api/candidate/cvs", token);

        assertThat(firstUpload.statusCode()).isEqualTo(201);
        assertThat(firstUpload.body()).contains("\"versionNumber\":1");
        assertThat(firstUpload.body()).contains("\"active\":true");
        assertThat(firstUpload.body()).contains("\"fileName\":\"candidate-cv-v1.pdf\"");

        assertThat(secondUpload.statusCode()).isEqualTo(201);
        assertThat(secondUpload.body()).contains("\"versionNumber\":2");
        assertThat(secondUpload.body()).contains("\"active\":true");

        assertThat(history.statusCode()).isEqualTo(200);
        assertThat(history.body()).contains("\"fileName\":\"candidate-cv-v2.pdf\"");
        assertThat(history.body()).contains("\"fileName\":\"candidate-cv-v1.pdf\"");
        assertThat(history.body().indexOf("candidate-cv-v2.pdf")).isLessThan(history.body().indexOf("candidate-cv-v1.pdf"));
    }

    @Test
    void uploadingCvExtractsSkillsIntoCandidateProfile() throws Exception {
        String token = registerAndGetToken(
                "Skill Candidate",
                "skill-candidate@example.com",
                "CANDIDATE"
        );

        HttpResponse<String> upload = uploadCv(token, "skill-candidate.pdf", "Java Spring Boot SQL");

        assertThat(upload.statusCode()).isEqualTo(201);
        assertThat(upload.body()).contains("\"parseStatus\":\"PARSED\"");

        HttpResponse<String> profile = get("/api/candidates/me", token);

        assertThat(profile.statusCode()).isEqualTo(200);
        assertThat(profile.body()).contains("\"skills\":[\"Java\",\"Spring Boot\",\"PostgreSQL\"]");
        assertThat(profile.body()).contains("\"experienceYears\":3");
        assertThat(profile.body()).contains("\"educationLevel\":\"Bachelor\"");
        assertThat(candidateRepository.findAll().getFirst().getEmbeddingText())
                .contains("Java", "Spring Boot", "PostgreSQL", "Bachelor");
        assertThat(candidateRepository.findAll().getFirst().getEmbeddingUpdatedAt()).isNotNull();
    }

    @Test
    void candidateCanGenerateSkillsForUploadedCv() throws Exception {
        String token = registerAndGetToken(
                "Manual Parse Candidate",
                "manual-parse-candidate@example.com",
                "CANDIDATE"
        );
        HttpResponse<String> upload = uploadCv(token, "manual-parse.pdf", "Manual CV content");

        Long cvId = extractLong(upload.body(), "\"id\":");
        HttpResponse<String> response = postJson("/api/candidate/cvs/" + cvId + "/extract-skills", "{}", token);

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"parseStatus\":\"PARSED\"");

        HttpResponse<String> profile = get("/api/candidates/me", token);
        assertThat(profile.body()).contains("\"skills\":[\"Java\",\"Spring Boot\",\"PostgreSQL\"]");
    }

    @Test
    void recruiterCannotUploadCandidateCv() throws Exception {
        String token = registerAndGetToken(
                "Recruiter User",
                "recruiter-cv@example.com",
                "RECRUITER"
        );

        HttpResponse<String> response = uploadCv(token, "recruiter-cv.pdf", "not allowed");

        assertThat(response.statusCode()).isIn(401, 403);
    }

    private String registerAndGetToken(String fullName, String email, String role) throws Exception {
        HttpResponse<String> response = postJson(
                "/api/auth/register",
                """
                        {
                          "fullName": "%s",
                          "email": "%s",
                          "password": "password123",
                          "role": "%s"
                        }
                        """.formatted(fullName, email, role),
                null
        );

        assertThat(response.statusCode()).isEqualTo(201);
        String responseBody = response.body();
        int tokenStart = responseBody.indexOf("\"token\":\"") + 9;
        int tokenEnd = responseBody.indexOf('"', tokenStart);
        return responseBody.substring(tokenStart, tokenEnd);
    }

    private HttpResponse<String> uploadCv(String token, String fileName, String content) throws Exception {
        String boundary = "----SmartHireBoundary";
        String body = "--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n"
                + "Content-Type: application/pdf\r\n\r\n"
                + content + "\r\n"
                + "--" + boundary + "--\r\n";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/candidate/cvs"))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postJson(String path, String body, String token) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body));

        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }

        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(String path, String token) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private Long extractLong(String body, String marker) {
        int start = body.indexOf(marker) + marker.length();
        int end = start;
        while (end < body.length() && Character.isDigit(body.charAt(end))) {
            end++;
        }
        return Long.parseLong(body.substring(start, end));
    }

    @TestConfiguration
    static class S3TestConfiguration {

        @Bean
        @Primary
        S3Client mockS3Client() {
            S3Client s3Client = mock(S3Client.class);
            when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                    .thenReturn(PutObjectResponse.builder().build());
            return s3Client;
        }

        @Bean
        @Primary
        CvParsingClient mockCvParsingClient() {
            return (fileName, content, contentType) -> new CvParseResult(
                    List.of("Java", "Spring Boot", "PostgreSQL"),
                    3,
                    "Bachelor"
            );
        }

        @Bean
        @Primary
        CvFileDownloader mockCvFileDownloader() {
            return fileUrl -> "Downloaded PDF content".getBytes();
        }

        @Bean
        @Primary
        EmbeddingClient mockEmbeddingClient() {
            return text -> List.of(0.1, 0.2, 0.3);
        }

        @Bean
        @Primary
        EmbeddingStore mockEmbeddingStore() {
            return new EmbeddingStore() {
                @Override
                public void saveJobEmbedding(Long jobId, List<Double> embedding) {
                }

                @Override
                public void saveCandidateEmbedding(Long candidateId, List<Double> embedding) {
                }
            };
        }
    }
}
