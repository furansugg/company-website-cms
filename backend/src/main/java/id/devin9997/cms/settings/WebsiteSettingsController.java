package id.devin9997.cms.settings;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.exception.NotFoundException;
import id.devin9997.cms.media.MediaDto;
import id.devin9997.cms.media.MediaRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class WebsiteSettingsController {

    private final WebsiteSettingsRepository repository;
    private final MediaRepository mediaRepository;
    private final AuditLogService auditLogService;

    public WebsiteSettingsController(WebsiteSettingsRepository repository,
                                     MediaRepository mediaRepository,
                                     AuditLogService auditLogService) {
        this.repository = repository;
        this.mediaRepository = mediaRepository;
        this.auditLogService = auditLogService;
    }

    public record WebsiteSettingsDto(
            Long id, String siteName, MediaDto logo, MediaDto favicon, String primaryColor,
            String footerText, String contactEmail,
            String facebookUrl, String instagramUrl, String twitterUrl, String linkedinUrl, String youtubeUrl,
            String defaultMetaTitle, String defaultMetaDescription, MediaDto ogImage, String robotsTxt) {
        public static WebsiteSettingsDto from(WebsiteSettingsEntity e, MediaRepository mr) {
            MediaDto logo    = e.getLogoId()    == null ? null : mr.findById(e.getLogoId()).map(MediaDto::from).orElse(null);
            MediaDto favicon = e.getFaviconId() == null ? null : mr.findById(e.getFaviconId()).map(MediaDto::from).orElse(null);
            MediaDto og      = e.getOgImageId() == null ? null : mr.findById(e.getOgImageId()).map(MediaDto::from).orElse(null);
            return new WebsiteSettingsDto(e.getId(), e.getSiteName(), logo, favicon, e.getPrimaryColor(),
                    e.getFooterText(), e.getContactEmail(),
                    e.getFacebookUrl(), e.getInstagramUrl(), e.getTwitterUrl(), e.getLinkedinUrl(), e.getYoutubeUrl(),
                    e.getDefaultMetaTitle(), e.getDefaultMetaDescription(), og, e.getRobotsTxt());
        }
    }

    public record UpdateSettingsRequest(
            String siteName, Long logoId, Long faviconId, String primaryColor,
            String footerText, String contactEmail,
            String facebookUrl, String instagramUrl, String twitterUrl, String linkedinUrl, String youtubeUrl,
            String defaultMetaTitle, String defaultMetaDescription, Long ogImageId, String robotsTxt) {}

    @GetMapping
    public WebsiteSettingsDto get() {
        return WebsiteSettingsDto.from(loadOrThrow(), mediaRepository);
    }

    @PutMapping
    @Transactional
    public WebsiteSettingsDto update(@RequestBody UpdateSettingsRequest req) {
        WebsiteSettingsEntity e = loadOrThrow();
        if (req.siteName() != null && !req.siteName().isBlank()) e.setSiteName(req.siteName().trim());
        if (req.logoId() != null) e.setLogoId(req.logoId() == 0L ? null : req.logoId());
        if (req.faviconId() != null) e.setFaviconId(req.faviconId() == 0L ? null : req.faviconId());
        if (req.primaryColor() != null) e.setPrimaryColor(req.primaryColor());
        if (req.footerText() != null) e.setFooterText(req.footerText());
        if (req.contactEmail() != null) e.setContactEmail(req.contactEmail());
        if (req.facebookUrl() != null) e.setFacebookUrl(req.facebookUrl());
        if (req.instagramUrl() != null) e.setInstagramUrl(req.instagramUrl());
        if (req.twitterUrl() != null) e.setTwitterUrl(req.twitterUrl());
        if (req.linkedinUrl() != null) e.setLinkedinUrl(req.linkedinUrl());
        if (req.youtubeUrl() != null) e.setYoutubeUrl(req.youtubeUrl());
        if (req.defaultMetaTitle() != null) e.setDefaultMetaTitle(req.defaultMetaTitle());
        if (req.defaultMetaDescription() != null) e.setDefaultMetaDescription(req.defaultMetaDescription());
        if (req.ogImageId() != null) e.setOgImageId(req.ogImageId() == 0L ? null : req.ogImageId());
        if (req.robotsTxt() != null) e.setRobotsTxt(req.robotsTxt());
        auditLogService.log("WEBSITE_SETTINGS_UPDATED", "WebsiteSettings", 1, null);
        return WebsiteSettingsDto.from(repository.save(e), mediaRepository);
    }

    private WebsiteSettingsEntity loadOrThrow() {
        return repository.findById(1L).orElseThrow(() -> new NotFoundException("Website settings not initialized"));
    }
}
