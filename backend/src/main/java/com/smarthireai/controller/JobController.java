package com.smarthireai.controller;

import com.smarthireai.dto.CreateJobRequest;
import com.smarthireai.dto.TopCandidateResponse;
import com.smarthireai.entity.Job;
import com.smarthireai.service.JobService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public List<Job> getJobs() {
        return jobService.getAllJobs();
    }

    @GetMapping("/my")
    public List<Job> getMyJobs() {
        return jobService.getMyJobs();
    }

    @GetMapping("/{jobId}")
    public Job getMyJob(@PathVariable Long jobId) {
        return jobService.getMyJob(jobId);
    }

    @GetMapping("/{jobId}/top-candidates")
    public List<TopCandidateResponse> getTopCandidates(
            @PathVariable Long jobId,
            @RequestParam(required = false) Integer limit
    ) {
        return jobService.getTopCandidates(jobId, limit);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Job createJob(@RequestBody CreateJobRequest request) {
        return jobService.createJob(request);
    }

    @PutMapping("/{jobId}")
    public Job updateJob(@PathVariable Long jobId, @RequestBody CreateJobRequest request) {
        return jobService.updateJob(jobId, request);
    }
}
