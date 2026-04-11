package com.smarthireai.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class JobControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateJob() throws Exception {
        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Java Developer",
                                  "company": "Smart Hire AI",
                                  "requiredSkills": ["Java", "Spring Boot"],
                                  "minimumExperienceYears": 2,
                                  "educationLevel": "Bachelor"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Java Developer"))
                .andExpect(jsonPath("$.company").value("Smart Hire AI"));
    }

    @Test
    void shouldListJobs() throws Exception {
        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Frontend Developer",
                                  "company": "Tech Corp",
                                  "requiredSkills": ["React", "TypeScript"],
                                  "minimumExperienceYears": 1,
                                  "educationLevel": "Bachelor"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Frontend Developer"))
                .andExpect(jsonPath("$[0].company").value("Tech Corp"));
    }
}
