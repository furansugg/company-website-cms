package id.devin9997.cms.banner;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.exception.NotFoundException;
import id.devin9997.cms.media.MediaDto;
import id.devin9997.cms.media.MediaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/banners")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class BannerController {

    private final BannerRepository repository;
    private final MediaRepository mediaRepository;
    private final AuditLogService auditLogService;

    public BannerController(BannerRepository repository, MediaRepository mediaRepository,
                            AuditLogService auditLogService) {
        this.repository = repository;
        this.mediaRepository = mediaRepository;
        this.auditLogService = auditLogService;
    }

    public record BannerDto(Long id, String title, String subtitle, MediaDto image,
                            String ctaText, String ctaLink, boolean active, Integer sortOrder) {
        public static BannerDto from(BannerEntity b, MediaRepository mr) {
            MediaDto image = null;
            if (b.getImageId() != null) image = mr.findById(b.getImageId()).map(MediaDto::from).orElse(null);
            return new BannerDto(b.getId(), b.getTitle(), b.getSubtitle(), image,
                    b.getCtaText(), b.getCtaLink(), b.isActive(), b.getSortOrder());
        }
    }

    public record UpsertBannerRequest(@NotBlank String title, String subtitle, Long imageId,
                                      String ctaText, String ctaLink, Boolean active, Integer sortOrder) {}

    @GetMapping
    public List<BannerDto> list() {
        return repository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(b -> BannerDto.from(b, mediaRepository)).toList();
    }

    @PostMapping
    @Transactional
    public BannerDto create(@Valid @RequestBody UpsertBannerRequest req) {
        BannerEntity b = new BannerEntity();
        b.setTitle(req.title().trim());
        b.setSubtitle(req.subtitle());
        b.setImageId(req.imageId());
        b.setCtaText(req.ctaText());
        b.setCtaLink(req.ctaLink());
        if (req.active() != null) b.setActive(req.active());
        if (req.sortOrder() != null) b.setSortOrder(req.sortOrder());
        BannerEntity saved = repository.save(b);
        auditLogService.log("BANNER_CREATED", "Banner", saved.getId(), saved.getTitle());
        return BannerDto.from(saved, mediaRepository);
    }

    @PutMapping("/{id}")
    @Transactional
    public BannerDto update(@PathVariable Long id, @Valid @RequestBody UpsertBannerRequest req) {
        BannerEntity b = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Banner not found: " + id));
        b.setTitle(req.title().trim());
        if (req.subtitle() != null) b.setSubtitle(req.subtitle());
        if (req.imageId() != null) b.setImageId(req.imageId() == 0L ? null : req.imageId());
        if (req.ctaText() != null) b.setCtaText(req.ctaText());
        if (req.ctaLink() != null) b.setCtaLink(req.ctaLink());
        if (req.active() != null) b.setActive(req.active());
        if (req.sortOrder() != null) b.setSortOrder(req.sortOrder());
        auditLogService.log("BANNER_UPDATED", "Banner", id, b.getTitle());
        return BannerDto.from(b, mediaRepository);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        BannerEntity b = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Banner not found: " + id));
        repository.delete(b);
        auditLogService.log("BANNER_DELETED", "Banner", id, b.getTitle());
    }
}
