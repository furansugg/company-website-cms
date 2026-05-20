package id.devin9997.cms.category;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.SlugUtil;
import id.devin9997.cms.common.exception.BadRequestException;
import id.devin9997.cms.common.exception.ConflictException;
import id.devin9997.cms.common.exception.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','EDITOR')")
public class CategoryController {

    private final CategoryRepository repository;
    private final AuditLogService auditLogService;

    public CategoryController(CategoryRepository repository, AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    public record CategoryDto(Long id, String name, String slug, String description,
                              OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        static CategoryDto from(CategoryEntity c) {
            return new CategoryDto(c.getId(), c.getName(), c.getSlug(), c.getDescription(),
                    c.getCreatedAt(), c.getUpdatedAt());
        }
    }

    public record UpsertCategoryRequest(@NotBlank String name, String slug, String description) {}

    @GetMapping
    public List<CategoryDto> list() {
        return repository.findAll().stream().map(CategoryDto::from).toList();
    }

    @GetMapping("/{id}")
    public CategoryDto get(@PathVariable Long id) {
        return CategoryDto.from(repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found: " + id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public CategoryDto create(@Valid @RequestBody UpsertCategoryRequest req) {
        String slug = (req.slug() == null || req.slug().isBlank())
                ? SlugUtil.toSlug(req.name())
                : SlugUtil.toSlug(req.slug());
        if (slug.isBlank()) throw new BadRequestException("Slug cannot be empty");
        if (repository.existsBySlug(slug)) throw new ConflictException("Slug already used: " + slug);
        CategoryEntity c = new CategoryEntity();
        c.setName(req.name().trim());
        c.setSlug(slug);
        c.setDescription(req.description());
        CategoryEntity saved = repository.save(c);
        auditLogService.log("CATEGORY_CREATED", "Category", saved.getId(), saved.getSlug());
        return CategoryDto.from(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public CategoryDto update(@PathVariable Long id, @Valid @RequestBody UpsertCategoryRequest req) {
        CategoryEntity c = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found: " + id));
        c.setName(req.name().trim());
        if (req.slug() != null && !req.slug().isBlank()) {
            String newSlug = SlugUtil.toSlug(req.slug());
            if (!newSlug.equals(c.getSlug()) && repository.existsBySlug(newSlug))
                throw new ConflictException("Slug already used: " + newSlug);
            c.setSlug(newSlug);
        }
        c.setDescription(req.description());
        auditLogService.log("CATEGORY_UPDATED", "Category", id, c.getSlug());
        return CategoryDto.from(repository.save(c));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public void delete(@PathVariable Long id) {
        CategoryEntity c = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found: " + id));
        repository.delete(c);
        auditLogService.log("CATEGORY_DELETED", "Category", id, c.getSlug());
    }
}
