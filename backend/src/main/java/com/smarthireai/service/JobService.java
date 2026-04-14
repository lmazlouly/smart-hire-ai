package com.smarthireai.service;

import com.smarthireai.dto.CreateJobRequest;
import com.smarthireai.entity.Job;
import com.smarthireai.entity.User;
import com.smarthireai.repository.JobRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job createJob(CreateJobRequest request) {
        // TODO: This needs to be updated to work with authentication
        // For now, creating a placeholder User object
        User tempUser = new User();
        tempUser.setEmail("recruiter@temp.com");
        
        Job job = new Job(
                tempUser,
                request.title(),
                request.company(),
                new ArrayList<>(request.requiredSkills() == null ? List.of() : request.requiredSkills()),
                request.minimumExperienceYears(),
                request.educationLevel()
        );

        return jobRepository.save(job);
    }
}
