package id.devin9997.cms.tag;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.SlugUtil;
import id.devin9997.cms.common.exception.BadRequestException;
import id.devin9997.cms.common.exception.ConflictException;
import id.devin9997.cms.common.exception.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tags")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','EDITOR')")
public class TagController {

    private final TagRepository repository;
    private final AuditLogService auditLogService;

    public TagController(TagRepository repository, AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    public record TagDto(Long id, String name, String slug) {
        static TagDto from(TagEntity t) { return new TagDto(t.getId(), t.getName(), t.getSlug()); }
    }

    public record UpsertTagRequest(@NotBlank String name, String slug) {}

    @GetMapping
    public List<TagDto> list() {
        return repository.findAll().stream().map(TagDto::from).toList();
    }

    @PostMapping
    public TagDto create(@Valid @RequestBody UpsertTagRequest req) {
        String slug = (req.slug() == null || req.slug().isBlank()) ? SlugUtil.toSlug(req.name()) : SlugUtil.toSlug(req.slug());
        if (slug.isBlank()) throw new BadRequestException("Slug cannot be empty");
        if (repository.existsBySlug(slug)) throw new ConflictException("Slug already used: " + slug);
        TagEntity t = new TagEntity();
        t.setName(req.name().trim());
        t.setSlug(slug);
        TagEntity saved = repository.save(t);
        auditLogService.log("TAG_CREATED", "Tag", saved.getId(), saved.getSlug());
        return TagDto.from(saved);
    }

    @PutMapping("/{id}")
    public TagDto update(@PathVariable Long id, @Valid @RequestBody UpsertTagRequest req) {
        TagEntity t = repository.findById(id).orElseThrow(() -> new NotFoundException("Tag not found: " + id));
        t.setName(req.name().trim());
        if (req.slug() != null && !req.slug().isBlank()) {
            String newSlug = SlugUtil.toSlug(req.slug());
            if (!newSlug.equals(t.getSlug()) && repository.existsBySlug(newSlug))
                throw new ConflictException("Slug already used: " + newSlug);
            t.setSlug(newSlug);
        }
        auditLogService.log("TAG_UPDATED", "Tag", id, t.getSlug());
        return TagDto.from(repository.save(t));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public void delete(@PathVariable Long id) {
        TagEntity t = repository.findById(id).orElseThrow(() -> new NotFoundException("Tag not found: " + id));
        repository.delete(t);
        auditLogService.log("TAG_DELETED", "Tag", id, t.getSlug());
    }
}
