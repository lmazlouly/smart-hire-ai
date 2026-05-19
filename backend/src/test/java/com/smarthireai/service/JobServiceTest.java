package com.smarthireai.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.smarthireai.dto.CreateJobRequest;
import com.smarthireai.entity.Job;
import com.smarthireai.entity.Role;
import com.smarthireai.repository.AppUserRepository;
import com.smarthireai.repository.JobRepository;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@SpringBootTest
class JobServiceTest {

    @Autowired
    private JobService jobService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        jobRepository.deleteAll();
        appUserRepository.deleteAll();
    }

    @Test
    void createJobAssociatesTheAuthenticatedRecruiter() {
        appUserRepository.save(new com.smarthireai.entity.AppUser(
                "Recruiter User",
                "recruiter@example.com",
                "encoded-password",
                Role.RECRUITER
        ));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "recruiter@example.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_RECRUITER"))
        ));

        Job job = jobService.createJob(new CreateJobRequest(
                "Backend Engineer",
                "Smart Hire AI",
                List.of("Java", "Spring"),
                3,
                "Bachelor"
        ));

        assertThat(job.getRecruiter().getEmail()).isEqualTo("recruiter@example.com");
    }
}
