package com.smarthireai.service;

import com.smarthireai.dto.CreateJobRequest;
import com.smarthireai.entity.Job;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class JobService {

    private final List<Job> jobs = new ArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public List<Job> getAllJobs() {
        return jobs;
    }

    public Job createJob(CreateJobRequest request) {
        Job job = new Job(
                idCounter.getAndIncrement(),
                request.title(),
                request.company(),
                request.requiredSkills(),
                request.minimumExperienceYears(),
                request.educationLevel()
        );

        jobs.add(job);
        return job;
    }
}
