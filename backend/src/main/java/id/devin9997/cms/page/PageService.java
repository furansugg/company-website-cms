package id.devin9997.cms.page;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.PublishStatus;
import id.devin9997.cms.common.SlugUtil;
import id.devin9997.cms.common.exception.BadRequestException;
import id.devin9997.cms.common.exception.ConflictException;
import id.devin9997.cms.common.exception.NotFoundException;
import id.devin9997.cms.security.SecurityUtil;
import java.time.OffsetDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PageService {

    private final PageRepository repository;
    private final AuditLogService auditLogService;

    public PageService(PageRepository repository, AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<PageEntity> list(String search, PublishStatus status, Pageable pageable) {
        boolean hasSearch = search != null && !search.isBlank();
        if (status != null && hasSearch) {
            return repository.findByStatusAndTitleContainingIgnoreCase(status, search.trim(), pageable);
        } else if (status != null) {
            return repository.findByStatus(status, pageable);
        } else if (hasSearch) {
            return repository.findByTitleContainingIgnoreCase(search.trim(), pageable);
        }
        return repository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public PageEntity get(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Page not found: " + id));
    }

    @Transactional(readOnly = true)
    public PageEntity getBySlug(String slug) {
        return repository.findBySlug(slug).orElseThrow(() -> new NotFoundException("Page not found: " + slug));
    }

    @Transactional
    public PageEntity create(String title, String slug, String content, String excerpt,
                             String metaTitle, String metaDescription,
                             PublishStatus status, Long featuredImageId) {
        if (title == null || title.isBlank()) throw new BadRequestException("Title is required");
        String effectiveSlug = (slug == null || slug.isBlank()) ? SlugUtil.toSlug(title) : SlugUtil.toSlug(slug);
        if (effectiveSlug.isBlank()) throw new BadRequestException("Slug cannot be empty");
        if (repository.existsBySlug(effectiveSlug)) throw new ConflictException("Slug already used: " + effectiveSlug);

        PublishStatus effectiveStatus = status == null ? PublishStatus.DRAFT : status;
        if (effectiveStatus == PublishStatus.PUBLISHED && (content == null || content.isBlank())) {
            throw new BadRequestException("Content is required when publishing");
        }

        PageEntity page = new PageEntity();
        page.setTitle(title.trim());
        page.setSlug(effectiveSlug);
        page.setContent(content == null ? "" : content);
        page.setExcerpt(excerpt);
        page.setMetaTitle(metaTitle);
        page.setMetaDescription(metaDescription);
        page.setStatus(effectiveStatus);
        page.setFeaturedImageId(featuredImageId);
        if (effectiveStatus == PublishStatus.PUBLISHED) page.setPublishedAt(OffsetDateTime.now());
        SecurityUtil.currentUserDetails().ifPresent(d -> {
            page.setCreatedBy(d.getId());
            page.setUpdatedBy(d.getId());
        });
        PageEntity saved = repository.save(page);
        auditLogService.log("PAGE_CREATED", "Page", saved.getId(), saved.getSlug());
        return saved;
    }

    @Transactional
    public PageEntity update(Long id, String title, String slug, String content, String excerpt,
                             String metaTitle, String metaDescription,
                             PublishStatus status, Long featuredImageId) {
        PageEntity page = get(id);
        if (title != null) page.setTitle(title.trim());
        if (slug != null) {
            String newSlug = SlugUtil.toSlug(slug);
            if (newSlug.isBlank()) throw new BadRequestException("Slug cannot be empty");
            if (!newSlug.equals(page.getSlug()) && repository.existsBySlug(newSlug)) {
                throw new ConflictException("Slug already used: " + newSlug);
            }
            page.setSlug(newSlug);
        }
        if (content != null) page.setContent(content);
        if (excerpt != null) page.setExcerpt(excerpt);
        if (metaTitle != null) page.setMetaTitle(metaTitle);
        if (metaDescription != null) page.setMetaDescription(metaDescription);
        if (featuredImageId != null) page.setFeaturedImageId(featuredImageId == 0L ? null : featuredImageId);
        if (status != null) {
            if (status == PublishStatus.PUBLISHED) {
                if (page.getContent() == null || page.getContent().isBlank())
                    throw new BadRequestException("Content is required when publishing");
                if (page.getPublishedAt() == null) page.setPublishedAt(OffsetDateTime.now());
            }
            page.setStatus(status);
        }
        SecurityUtil.currentUserDetails().ifPresent(d -> page.setUpdatedBy(d.getId()));
        auditLogService.log("PAGE_UPDATED", "Page", id, page.getSlug());
        return page;
    }

    @Transactional
    public PageEntity changeStatus(Long id, PublishStatus status) {
        PageEntity page = get(id);
        if (status == PublishStatus.PUBLISHED && (page.getContent() == null || page.getContent().isBlank())) {
            throw new BadRequestException("Content is required when publishing");
        }
        page.setStatus(status);
        if (status == PublishStatus.PUBLISHED && page.getPublishedAt() == null) {
            page.setPublishedAt(OffsetDateTime.now());
        }
        SecurityUtil.currentUserDetails().ifPresent(d -> page.setUpdatedBy(d.getId()));
        auditLogService.log("PAGE_STATUS_" + status.name(), "Page", id, page.getSlug());
        return page;
    }

    @Transactional
    public void delete(Long id) {
        PageEntity page = get(id);
        repository.delete(page);
        auditLogService.log("PAGE_DELETED", "Page", id, page.getSlug());
    }

    public long count() { return repository.count(); }
    public long countPublished() { return repository.countByStatus(PublishStatus.PUBLISHED); }
    public long countDraft() { return repository.countByStatus(PublishStatus.DRAFT); }
}
