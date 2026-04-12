package com.smarthireai.service;

import com.smarthireai.dto.CreateJobRequest;
import com.smarthireai.entity.Job;
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
        Job job = new Job(
                request.title(),
                request.company(),
                new ArrayList<>(request.requiredSkills() == null ? List.of() : request.requiredSkills()),
                request.minimumExperienceYears(),
                request.educationLevel()
        );

        return jobRepository.save(job);
    }
}
