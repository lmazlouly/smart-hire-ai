package com.smarthireai.repository;

import com.smarthireai.entity.Job;
import com.smarthireai.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByRecruiterOrderByIdDesc(User recruiter);

    Optional<Job> findByIdAndRecruiter(Long id, User recruiter);
}
