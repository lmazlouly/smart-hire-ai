package com.smarthireai.controller;

import static org.assertj.core.api.Assertions.assertThat;

import com.smarthireai.repository.JobRepository;
import com.smarthireai.repository.UserRepository;
import com.smarthireai.entity.Candidate;
import com.smarthireai.entity.User;
import com.smarthireai.repository.CandidateRepository;
import com.smarthireai.service.CandidateRankingStore;
import com.smarthireai.service.EmbeddingClient;
import com.smarthireai.service.EmbeddingStore;
import java.util.ArrayList;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class JobControllerTest {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private TestCandidateRankingStore candidateRankingStore;

    @LocalServerPort
    private int port;

    @AfterEach
    void tearDown() {
        candidateRankingStore.clear();
        jobRepository.deleteAll();
        candidateRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void recruiterCanCreateJobWithJwtToken() throws Exception {
        String token = registerAndGetToken(
                "Recruiter User",
                "recruiter@example.com",
                "RECRUITER"
        );

        HttpResponse<String> response = postJson(
                "/api/jobs",
                """
                        {
                          "title": "Backend Engineer",
                          "company": "Smart Hire AI",
                          "requiredSkills": ["Java", "Spring"],
                          "minimumExperienceYears": 3,
                          "educationLevel": "Bachelor",
                          "location": "Casablanca, Morocco",
                          "department": "Engineering",
                          "employmentType": "Full-time",
                          "workMode": "Hybrid",
                          "salaryRange": "$45k - $65k",
                          "applicationDeadline": "2026-07-15",
                          "status": "Open"
                        }
                        """,
                token
        );

        assertThat(response.statusCode()).isEqualTo(201);
        assertThat(response.body()).contains("\"title\":\"Backend Engineer\"");
        assertThat(response.body()).contains("\"company\":\"Smart Hire AI\"");
        assertThat(response.body()).contains("\"location\":\"Casablanca, Morocco\"");
        assertThat(response.body()).contains("\"employmentType\":\"Full-time\"");
        assertThat(response.body()).contains("\"workMode\":\"Hybrid\"");
        assertThat(response.body()).contains("\"applicationDeadline\":\"2026-07-15\"");
        assertThat(response.body()).doesNotContain("recruiter");

        HttpResponse<String> jobsResponse = get("/api/jobs");
        assertThat(jobsResponse.statusCode()).isEqualTo(200);
        assertThat(jobsResponse.body()).contains("\"title\":\"Backend Engineer\"");
        assertThat(jobsResponse.body()).contains("\"company\":\"Smart Hire AI\"");
        assertThat(jobsResponse.body()).contains("\"status\":\"Open\"");
    }

    @Test
    void candidateCannotCreateJob() throws Exception {
        String token = registerAndGetToken(
                "Candidate User",
                "candidate@example.com",
                "CANDIDATE"
        );

        HttpResponse<String> response = postJson(
                "/api/jobs",
                """
                        {
                          "title": "Backend Engineer",
                          "company": "Smart Hire AI",
                          "requiredSkills": ["Java", "Spring"],
                          "minimumExperienceYears": 3,
                          "educationLevel": "Bachelor",
                          "location": "Casablanca, Morocco",
                          "department": "Engineering",
                          "employmentType": "Full-time",
                          "workMode": "Hybrid",
                          "salaryRange": "$45k - $65k",
                          "applicationDeadline": "2026-07-15",
                          "status": "Open"
                        }
                        """,
                token
        );

        assertThat(response.statusCode()).isIn(401, 403);
        assertThat(jobRepository.count()).isZero();
    }

    @Test
    void recruiterCanListOnlyTheirOwnJobsAndOpenDetails() throws Exception {
        String firstRecruiterToken = registerAndGetToken(
                "First Recruiter",
                "first-recruiter@example.com",
                "RECRUITER"
        );
        String secondRecruiterToken = registerAndGetToken(
                "Second Recruiter",
                "second-recruiter@example.com",
                "RECRUITER"
        );

        HttpResponse<String> firstJob = postJson("/api/jobs", jobPayload("Backend Engineer", "Platform"), firstRecruiterToken);
        postJson("/api/jobs", jobPayload("Frontend Engineer", "Product"), secondRecruiterToken);

        Long firstJobId = extractLong(firstJob.body(), "\"id\":");
        HttpResponse<String> myJobs = get("/api/jobs/my", firstRecruiterToken);
        HttpResponse<String> detail = get("/api/jobs/" + firstJobId, firstRecruiterToken);

        assertThat(myJobs.statusCode()).isEqualTo(200);
        assertThat(myJobs.body()).contains("\"title\":\"Backend Engineer\"");
        assertThat(myJobs.body()).doesNotContain("\"title\":\"Frontend Engineer\"");

        assertThat(detail.statusCode()).isEqualTo(200);
        assertThat(detail.body()).contains("\"title\":\"Backend Engineer\"");
        assertThat(detail.body()).contains("\"department\":\"Platform\"");
    }

    @Test
    void recruiterCanUpdateTheirOwnJobButNotAnotherRecruitersJob() throws Exception {
        String ownerToken = registerAndGetToken(
                "Owner Recruiter",
                "owner-recruiter@example.com",
                "RECRUITER"
        );
        String otherToken = registerAndGetToken(
                "Other Recruiter",
                "other-recruiter@example.com",
                "RECRUITER"
        );

        HttpResponse<String> created = postJson("/api/jobs", jobPayload("Backend Engineer", "Platform"), ownerToken);
        Long jobId = extractLong(created.body(), "\"id\":");

        HttpResponse<String> forbidden = putJson("/api/jobs/" + jobId, jobPayload("Stolen Title", "Other"), otherToken);
        HttpResponse<String> updated = putJson("/api/jobs/" + jobId, jobPayload("Senior Backend Engineer", "AI Platform"), ownerToken);

        assertThat(forbidden.statusCode()).isNotEqualTo(200);
        assertThat(updated.statusCode()).isEqualTo(200);
        assertThat(updated.body()).contains("\"title\":\"Senior Backend Engineer\"");
        assertThat(updated.body()).contains("\"department\":\"AI Platform\"");
        assertThat(updated.body()).contains("\"status\":\"Open\"");
    }

    @Test
    void recruiterJobCreateAndUpdateRefreshEmbeddingText() throws Exception {
        String token = registerAndGetToken(
                "Embedding Recruiter",
                "embedding-recruiter@example.com",
                "RECRUITER"
        );

        HttpResponse<String> created = postJson("/api/jobs", jobPayload("Backend Engineer", "Platform"), token);
        Long jobId = extractLong(created.body(), "\"id\":");

        assertThat(created.statusCode()).isEqualTo(201);
        assertThat(jobRepository.findById(jobId).orElseThrow().getEmbeddingText())
                .contains("Backend Engineer", "Java", "Spring", "Platform");
        assertThat(jobRepository.findById(jobId).orElseThrow().getEmbeddingUpdatedAt()).isNotNull();

        putJson("/api/jobs/" + jobId, jobPayload("Senior Backend Engineer", "AI Platform"), token);

        assertThat(jobRepository.findById(jobId).orElseThrow().getEmbeddingText())
                .contains("Senior Backend Engineer", "AI Platform");
    }

    @Test
    void recruiterCanRankTopCandidatesForOwnedJobUsingSemanticEmbeddingScores() throws Exception {
        String recruiterToken = registerAndGetToken(
                "Ranking Recruiter",
                "ranking-recruiter@example.com",
                "RECRUITER"
        );
        String otherRecruiterToken = registerAndGetToken(
                "Other Ranking Recruiter",
                "other-ranking-recruiter@example.com",
                "RECRUITER"
        );
        registerAndGetToken("React Candidate", "react-candidate@example.com", "CANDIDATE");
        registerAndGetToken("Java Candidate", "java-candidate@example.com", "CANDIDATE");

        Candidate reactCandidate = createCandidateProfile(
                "react-candidate@example.com",
                List.of("React", "TypeScript", "Frontend"),
                3,
                "Bachelor"
        );
        Candidate javaCandidate = createCandidateProfile(
                "java-candidate@example.com",
                List.of("Java", "Spring"),
                4,
                "Bachelor"
        );

        HttpResponse<String> created = postJson(
                "/api/jobs",
                """
                        {
                          "title": "Next.js Developer",
                          "company": "Smart Hire AI",
                          "requiredSkills": ["Next.js", "TypeScript"],
                          "minimumExperienceYears": 2,
                          "educationLevel": "Bachelor",
                          "location": "Remote",
                          "department": "Product",
                          "employmentType": "Full-time",
                          "workMode": "Remote",
                          "salaryRange": "$45k - $65k",
                          "applicationDeadline": "2026-07-15",
                          "status": "Open"
                        }
                        """,
                recruiterToken
        );
        Long jobId = extractLong(created.body(), "\"id\":");
        candidateRankingStore.setScores(List.of(
                new CandidateRankingStore.CandidateMatchScore(reactCandidate.getId(), 0.86),
                new CandidateRankingStore.CandidateMatchScore(javaCandidate.getId(), 0.24)
        ));

        HttpResponse<String> forbidden = get("/api/jobs/" + jobId + "/top-candidates", otherRecruiterToken);
        HttpResponse<String> response = get("/api/jobs/" + jobId + "/top-candidates?limit=5", recruiterToken);

        assertThat(forbidden.statusCode()).isNotEqualTo(200);
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"fullName\":\"React Candidate\"");
        assertThat(response.body()).contains("\"semanticScore\":86.0");
        assertThat(response.body()).contains("\"sharedSkills\":[\"TypeScript\"]");
        assertThat(response.body()).contains("\"missingSkills\":[\"Next.js\"]");
        assertThat(response.body()).contains("semantic match");
        assertThat(response.body().indexOf("React Candidate")).isLessThan(response.body().indexOf("Java Candidate"));
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

    private Candidate createCandidateProfile(String email, List<String> skills, Integer experienceYears, String educationLevel) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Candidate candidate = new Candidate(user, new ArrayList<>(skills), experienceYears, educationLevel);
        candidate.setEmbeddingText("Skills: " + String.join(", ", skills));
        return candidateRepository.save(candidate);
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

    private HttpResponse<String> get(String path) throws Exception {
        return get(path, null);
    }

    private HttpResponse<String> get(String path, String token) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .GET();

        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }

        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> putJson(String path, String body, String token) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .PUT(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private String jobPayload(String title, String department) {
        return """
                {
                  "title": "%s",
                  "company": "Smart Hire AI",
                  "requiredSkills": ["Java", "Spring"],
                  "minimumExperienceYears": 3,
                  "educationLevel": "Bachelor",
                  "location": "Casablanca, Morocco",
                  "department": "%s",
                  "employmentType": "Full-time",
                  "workMode": "Hybrid",
                  "salaryRange": "$45k - $65k",
                  "applicationDeadline": "2026-07-15",
                  "status": "Open"
                }
                """.formatted(title, department);
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
    static class EmbeddingTestConfiguration {

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

        @Bean
        @Primary
        TestCandidateRankingStore testCandidateRankingStore() {
            return new TestCandidateRankingStore();
        }
    }

    static class TestCandidateRankingStore implements CandidateRankingStore {
        private List<CandidateMatchScore> scores = new ArrayList<>();

        @Override
        public List<CandidateMatchScore> findTopCandidatesForJob(Long jobId, int limit) {
            return scores.stream().limit(limit).toList();
        }

        void setScores(List<CandidateMatchScore> scores) {
            this.scores = new ArrayList<>(scores);
        }

        void clear() {
            scores.clear();
        }
    }
}
