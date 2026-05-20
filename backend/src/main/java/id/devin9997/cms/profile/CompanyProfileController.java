package id.devin9997.cms.profile;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.exception.NotFoundException;
import id.devin9997.cms.media.MediaDto;
import id.devin9997.cms.media.MediaRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/company-profile")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class CompanyProfileController {

    private final CompanyProfileRepository repository;
    private final MediaRepository mediaRepository;
    private final AuditLogService auditLogService;

    public CompanyProfileController(CompanyProfileRepository repository,
                                    MediaRepository mediaRepository,
                                    AuditLogService auditLogService) {
        this.repository = repository;
        this.mediaRepository = mediaRepository;
        this.auditLogService = auditLogService;
    }

    public record CompanyProfileDto(
            Long id, String name, String tagline, String description,
            String vision, String mission, String address, String phone, String email,
            MediaDto logo,
            String facebookUrl, String instagramUrl, String twitterUrl,
            String linkedinUrl, String youtubeUrl) {
        public static CompanyProfileDto from(CompanyProfileEntity e, MediaRepository mediaRepository) {
            MediaDto logo = null;
            if (e.getLogoId() != null) logo = mediaRepository.findById(e.getLogoId()).map(MediaDto::from).orElse(null);
            return new CompanyProfileDto(e.getId(), e.getName(), e.getTagline(), e.getDescription(),
                    e.getVision(), e.getMission(), e.getAddress(), e.getPhone(), e.getEmail(),
                    logo, e.getFacebookUrl(), e.getInstagramUrl(), e.getTwitterUrl(),
                    e.getLinkedinUrl(), e.getYoutubeUrl());
        }
    }

    public record UpdateProfileRequest(
            String name, String tagline, String description, String vision, String mission,
            String address, String phone, String email, Long logoId,
            String facebookUrl, String instagramUrl, String twitterUrl,
            String linkedinUrl, String youtubeUrl) {}

    @GetMapping
    public CompanyProfileDto get() {
        return CompanyProfileDto.from(loadOrThrow(), mediaRepository);
    }

    @PutMapping
    @Transactional
    public CompanyProfileDto update(@RequestBody UpdateProfileRequest req) {
        CompanyProfileEntity e = loadOrThrow();
        if (req.name() != null && !req.name().isBlank()) e.setName(req.name().trim());
        if (req.tagline() != null) e.setTagline(req.tagline());
        if (req.description() != null) e.setDescription(req.description());
        if (req.vision() != null) e.setVision(req.vision());
        if (req.mission() != null) e.setMission(req.mission());
        if (req.address() != null) e.setAddress(req.address());
        if (req.phone() != null) e.setPhone(req.phone());
        if (req.email() != null) e.setEmail(req.email());
        if (req.logoId() != null) e.setLogoId(req.logoId() == 0L ? null : req.logoId());
        if (req.facebookUrl() != null) e.setFacebookUrl(req.facebookUrl());
        if (req.instagramUrl() != null) e.setInstagramUrl(req.instagramUrl());
        if (req.twitterUrl() != null) e.setTwitterUrl(req.twitterUrl());
        if (req.linkedinUrl() != null) e.setLinkedinUrl(req.linkedinUrl());
        if (req.youtubeUrl() != null) e.setYoutubeUrl(req.youtubeUrl());
        auditLogService.log("COMPANY_PROFILE_UPDATED", "CompanyProfile", 1, null);
        return CompanyProfileDto.from(repository.save(e), mediaRepository);
    }

    private CompanyProfileEntity loadOrThrow() {
        return repository.findById(1L).orElseThrow(() -> new NotFoundException("Company profile not initialized"));
    }
}
