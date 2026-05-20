package id.devin9997.cms.service;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.SlugUtil;
import id.devin9997.cms.common.exception.BadRequestException;
import id.devin9997.cms.common.exception.ConflictException;
import id.devin9997.cms.common.exception.NotFoundException;
import id.devin9997.cms.media.MediaDto;
import id.devin9997.cms.media.MediaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/services")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class ServiceController {

    private final ServiceRepository repository;
    private final MediaRepository mediaRepository;
    private final AuditLogService auditLogService;

    public ServiceController(ServiceRepository repository, MediaRepository mediaRepository,
                             AuditLogService auditLogService) {
        this.repository = repository;
        this.mediaRepository = mediaRepository;
        this.auditLogService = auditLogService;
    }

    public record ServiceDto(Long id, String name, String slug, String shortDescription,
                             String description, MediaDto image, BigDecimal price, String currency,
                             boolean active, Integer sortOrder) {
        public static ServiceDto from(ServiceEntity s, MediaRepository mr) {
            MediaDto image = null;
            if (s.getImageId() != null) image = mr.findById(s.getImageId()).map(MediaDto::from).orElse(null);
            return new ServiceDto(s.getId(), s.getName(), s.getSlug(), s.getShortDescription(),
                    s.getDescription(), image, s.getPrice(), s.getCurrency(),
                    s.isActive(), s.getSortOrder());
        }
    }

    public record UpsertServiceRequest(
            @NotBlank String name, String slug, String shortDescription, String description,
            Long imageId, BigDecimal price, String currency, Boolean active, Integer sortOrder) {}

    @GetMapping
    public List<ServiceDto> list() {
        return repository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(s -> ServiceDto.from(s, mediaRepository)).toList();
    }

    @GetMapping("/{id}")
    public ServiceDto get(@PathVariable Long id) {
        return ServiceDto.from(repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service not found: " + id)), mediaRepository);
    }

    @PostMapping
    @Transactional
    public ServiceDto create(@Valid @RequestBody UpsertServiceRequest req) {
        String slug = (req.slug() == null || req.slug().isBlank())
                ? SlugUtil.toSlug(req.name())
                : SlugUtil.toSlug(req.slug());
        if (slug.isBlank()) throw new BadRequestException("Slug cannot be empty");
        if (repository.existsBySlug(slug)) throw new ConflictException("Slug already used: " + slug);
        ServiceEntity s = new ServiceEntity();
        s.setName(req.name().trim());
        s.setSlug(slug);
        s.setShortDescription(req.shortDescription());
        s.setDescription(req.description());
        s.setImageId(req.imageId());
        s.setPrice(req.price());
        if (req.currency() != null) s.setCurrency(req.currency());
        if (req.active() != null) s.setActive(req.active());
        if (req.sortOrder() != null) s.setSortOrder(req.sortOrder());
        ServiceEntity saved = repository.save(s);
        auditLogService.log("SERVICE_CREATED", "Service", saved.getId(), saved.getSlug());
        return ServiceDto.from(saved, mediaRepository);
    }

    @PutMapping("/{id}")
    @Transactional
    public ServiceDto update(@PathVariable Long id, @Valid @RequestBody UpsertServiceRequest req) {
        ServiceEntity s = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service not found: " + id));
        s.setName(req.name().trim());
        if (req.slug() != null && !req.slug().isBlank()) {
            String newSlug = SlugUtil.toSlug(req.slug());
            if (!newSlug.equals(s.getSlug()) && repository.existsBySlug(newSlug))
                throw new ConflictException("Slug already used: " + newSlug);
            s.setSlug(newSlug);
        }
        if (req.shortDescription() != null) s.setShortDescription(req.shortDescription());
        if (req.description() != null) s.setDescription(req.description());
        if (req.imageId() != null) s.setImageId(req.imageId() == 0L ? null : req.imageId());
        if (req.price() != null) s.setPrice(req.price());
        if (req.currency() != null) s.setCurrency(req.currency());
        if (req.active() != null) s.setActive(req.active());
        if (req.sortOrder() != null) s.setSortOrder(req.sortOrder());
        auditLogService.log("SERVICE_UPDATED", "Service", id, s.getSlug());
        return ServiceDto.from(s, mediaRepository);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        ServiceEntity s = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service not found: " + id));
        repository.delete(s);
        auditLogService.log("SERVICE_DELETED", "Service", id, s.getSlug());
    }
}
