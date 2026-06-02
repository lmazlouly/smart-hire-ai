package com.smarthireai.service;

import com.smarthireai.dto.CvParseResult;
import com.smarthireai.entity.Candidate;
import com.smarthireai.entity.CvVersion;
import com.smarthireai.entity.UploadedFile;
import com.smarthireai.entity.User;
import com.smarthireai.repository.CandidateRepository;
import com.smarthireai.repository.CvVersionRepository;
import com.smarthireai.repository.UserRepository;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CvService {

    private final CvVersionRepository cvVersionRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    private final CvParsingClient cvParsingClient;
    private final CvFileDownloader cvFileDownloader;
    private final EmbeddingClient embeddingClient;
    private final EmbeddingStore embeddingStore;

    public CvService(
            CvVersionRepository cvVersionRepository,
            CandidateRepository candidateRepository,
            UserRepository userRepository,
            FileUploadService fileUploadService,
            CvParsingClient cvParsingClient,
            CvFileDownloader cvFileDownloader,
            EmbeddingClient embeddingClient,
            EmbeddingStore embeddingStore
    ) {
        this.cvVersionRepository = cvVersionRepository;
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.fileUploadService = fileUploadService;
        this.cvParsingClient = cvParsingClient;
        this.cvFileDownloader = cvFileDownloader;
        this.embeddingClient = embeddingClient;
        this.embeddingStore = embeddingStore;
    }

    public List<CvVersion> getMyCvVersions() {
        User candidate = getAuthenticatedCandidate();
        return cvVersionRepository.findByCandidateOrderByVersionNumberDesc(candidate);
    }

    public CvVersion uploadCv(MultipartFile file) throws IOException {
        User candidate = getAuthenticatedCandidate();

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CV file is required");
        }

        UploadedFile uploadedFile = fileUploadService.uploadFileWithoutSaving(file);
        int nextVersion = cvVersionRepository.findTopByCandidateOrderByVersionNumberDesc(candidate)
                .map(CvVersion::getVersionNumber)
                .orElse(0) + 1;

        for (CvVersion version : cvVersionRepository.findByCandidateOrderByVersionNumberDesc(candidate)) {
            version.setActive(false);
        }

        CvVersion cvVersion = new CvVersion();
        cvVersion.setCandidate(candidate);
        cvVersion.setFileName(uploadedFile.getFileName());
        cvVersion.setFileUrl(uploadedFile.getFileUrl());
        cvVersion.setFileType(uploadedFile.getFileType());
        cvVersion.setFileSize(uploadedFile.getFileSize());
        cvVersion.setVersionNumber(nextVersion);
        cvVersion.setActive(true);

        CvVersion savedVersion = cvVersionRepository.save(cvVersion);
        extractProfileFromFile(savedVersion, file.getBytes(), file.getOriginalFilename(), file.getContentType());
        return cvVersionRepository.save(savedVersion);
    }

    public CvVersion extractSkills(Long cvVersionId) throws IOException {
        User candidate = getAuthenticatedCandidate();
        CvVersion cvVersion = cvVersionRepository.findByIdAndCandidate(cvVersionId, candidate)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CV version was not found"));

        byte[] fileBytes = cvFileDownloader.download(cvVersion.getFileUrl());
        extractProfileFromFile(cvVersion, fileBytes, cvVersion.getFileName(), cvVersion.getFileType());
        return cvVersionRepository.save(cvVersion);
    }

    private void extractProfileFromFile(CvVersion cvVersion, byte[] fileBytes, String fileName, String contentType) {
        try {
            cvVersion.setParseStatus("PARSING");
            CvParseResult parseResult = cvParsingClient.parse(fileName, fileBytes, contentType);
            saveCandidateProfile(cvVersion.getCandidate(), parseResult);
            cvVersion.setParseStatus("PARSED");
            cvVersion.setParsedAt(LocalDateTime.now());
        } catch (Exception exception) {
            cvVersion.setParseStatus("FAILED");
        }
    }

    private void saveCandidateProfile(User user, CvParseResult parseResult) {
        Candidate profile = candidateRepository.findByUser(user)
                .orElseGet(() -> new Candidate(user, new ArrayList<>(), 0, null));

        profile.setSkills(new ArrayList<>(parseResult.skills() == null ? List.of() : parseResult.skills()));
        profile.setExperienceYears(parseResult.experienceYears());
        profile.setEducationLevel(parseResult.educationLevel());
        profile.setEmbeddingText(buildCandidateEmbeddingText(profile));
        profile.setEmbeddingUpdatedAt(LocalDateTime.now());

        Candidate savedProfile = candidateRepository.save(profile);
        saveCandidateVector(savedProfile);
    }

    private void saveCandidateVector(Candidate candidate) {
        try {
            embeddingStore.saveCandidateEmbedding(candidate.getId(), embeddingClient.embed(candidate.getEmbeddingText()));
        } catch (Exception ignored) {
        }
    }

    private String buildCandidateEmbeddingText(Candidate candidate) {
        return String.join("\n",
                "Name: " + nullToEmpty(candidate.getFullName()),
                "Email: " + nullToEmpty(candidate.getEmail()),
                "Skills: " + String.join(", ", candidate.getSkills() == null ? List.of() : candidate.getSkills()),
                "Experience years: " + nullToEmpty(candidate.getExperienceYears()),
                "Education level: " + nullToEmpty(candidate.getEducationLevel())
        );
    }

    private String nullToEmpty(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private User getAuthenticatedCandidate() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));

        if (user.getRole() != User.UserRole.CANDIDATE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Candidate role is required");
        }

        return user;
    }
}
