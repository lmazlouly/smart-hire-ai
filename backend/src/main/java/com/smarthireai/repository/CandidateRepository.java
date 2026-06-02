package com.smarthireai.repository;

import com.smarthireai.entity.Candidate;
import com.smarthireai.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    Optional<Candidate> findByUser(User user);
}
