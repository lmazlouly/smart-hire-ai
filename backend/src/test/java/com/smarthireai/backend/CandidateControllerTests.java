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
class CandidateControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateCandidate() throws Exception {
        mockMvc.perform(post("/api/candidates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Alice Johnson",
                                  "email": "alice@example.com",
                                  "skills": ["Java", "Spring Boot"],
                                  "experienceYears": 3,
                                  "educationLevel": "Bachelor"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.fullName").value("Alice Johnson"))
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.skills[0]").value("Java"));
    }

    @Test
    void shouldListCandidates() throws Exception {
        mockMvc.perform(post("/api/candidates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Bob Smith",
                                  "email": "bob@example.com",
                                  "skills": ["React"],
                                  "experienceYears": 2,
                                  "educationLevel": "Master"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/candidates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").value("Bob Smith"))
                .andExpect(jsonPath("$[0].email").value("bob@example.com"));
    }
}
