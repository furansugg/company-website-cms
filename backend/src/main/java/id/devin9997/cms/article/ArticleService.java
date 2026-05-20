package id.devin9997.cms.article;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.ArticleStatus;
import id.devin9997.cms.common.Role;
import id.devin9997.cms.common.SlugUtil;
import id.devin9997.cms.common.exception.BadRequestException;
import id.devin9997.cms.common.exception.ConflictException;
import id.devin9997.cms.common.exception.ForbiddenException;
import id.devin9997.cms.common.exception.NotFoundException;
import id.devin9997.cms.security.SecurityUtil;
import id.devin9997.cms.tag.TagEntity;
import id.devin9997.cms.tag.TagRepository;
import id.devin9997.cms.user.UserEntity;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final TagRepository tagRepository;
    private final AuditLogService auditLogService;

    public ArticleService(ArticleRepository articleRepository,
                          TagRepository tagRepository,
                          AuditLogService auditLogService) {
        this.articleRepository = articleRepository;
        this.tagRepository = tagRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<ArticleEntity> list(String search, ArticleStatus status, Long categoryId, Pageable pageable) {
        return articleRepository.search(search == null ? "" : search.trim(), status, categoryId, pageable);
    }

    @Transactional(readOnly = true)
    public ArticleEntity get(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Article not found: " + id));
    }

    @Transactional
    public ArticleEntity create(String title, String slug, String excerpt, String content,
                                Long categoryId, Long featuredImageId,
                                ArticleStatus desiredStatus,
                                String metaTitle, String metaDescription,
                                List<Long> tagIds) {
        if (title == null || title.isBlank()) throw new BadRequestException("Title is required");
        String effectiveSlug = (slug == null || slug.isBlank()) ? SlugUtil.toSlug(title) : SlugUtil.toSlug(slug);
        if (effectiveSlug.isBlank()) throw new BadRequestException("Slug cannot be empty");
        if (articleRepository.existsBySlug(effectiveSlug)) throw new ConflictException("Slug already used: " + effectiveSlug);

        UserEntity current = SecurityUtil.requireCurrentUser();
        ArticleStatus status = desiredStatus == null ? ArticleStatus.DRAFT : desiredStatus;
        guardStatusTransition(current, ArticleStatus.DRAFT, status);
        if (status == ArticleStatus.PUBLISHED && (content == null || content.isBlank())) {
            throw new BadRequestException("Content is required when publishing");
        }

        ArticleEntity a = new ArticleEntity();
        a.setTitle(title.trim());
        a.setSlug(effectiveSlug);
        a.setExcerpt(excerpt);
        a.setContent(content == null ? "" : content);
        a.setCategoryId(categoryId);
        a.setFeaturedImageId(featuredImageId);
        a.setAuthorId(current.getId());
        a.setStatus(status);
        a.setMetaTitle(metaTitle);
        a.setMetaDescription(metaDescription);
        if (status == ArticleStatus.PUBLISHED) a.setPublishedAt(OffsetDateTime.now());
        a.setTags(resolveTags(tagIds));
        ArticleEntity saved = articleRepository.save(a);
        auditLogService.log("ARTICLE_CREATED", "Article", saved.getId(), saved.getSlug());
        return saved;
    }

    @Transactional
    public ArticleEntity update(Long id, String title, String slug, String excerpt, String content,
                                Long categoryId, Long featuredImageId,
                                ArticleStatus desiredStatus,
                                String metaTitle, String metaDescription,
                                List<Long> tagIds) {
        ArticleEntity a = get(id);
        UserEntity current = SecurityUtil.requireCurrentUser();

        if (current.getRole() == Role.EDITOR && a.getAuthorId() != null
                && !a.getAuthorId().equals(current.getId())) {
            throw new ForbiddenException("Editors can only modify their own articles");
        }

        if (title != null) a.setTitle(title.trim());
        if (slug != null) {
            String newSlug = SlugUtil.toSlug(slug);
            if (newSlug.isBlank()) throw new BadRequestException("Slug cannot be empty");
            if (!newSlug.equals(a.getSlug()) && articleRepository.existsBySlug(newSlug))
                throw new ConflictException("Slug already used: " + newSlug);
            a.setSlug(newSlug);
        }
        if (excerpt != null) a.setExcerpt(excerpt);
        if (content != null) a.setContent(content);
        if (categoryId != null) a.setCategoryId(categoryId == 0L ? null : categoryId);
        if (featuredImageId != null) a.setFeaturedImageId(featuredImageId == 0L ? null : featuredImageId);
        if (metaTitle != null) a.setMetaTitle(metaTitle);
        if (metaDescription != null) a.setMetaDescription(metaDescription);
        if (tagIds != null) a.setTags(resolveTags(tagIds));
        if (desiredStatus != null && desiredStatus != a.getStatus()) {
            guardStatusTransition(current, a.getStatus(), desiredStatus);
            if (desiredStatus == ArticleStatus.PUBLISHED
                    && (a.getContent() == null || a.getContent().isBlank())) {
                throw new BadRequestException("Content is required when publishing");
            }
            a.setStatus(desiredStatus);
            if (desiredStatus == ArticleStatus.PUBLISHED && a.getPublishedAt() == null) {
                a.setPublishedAt(OffsetDateTime.now());
            }
        }
        auditLogService.log("ARTICLE_UPDATED", "Article", id, a.getSlug());
        return a;
    }

    @Transactional
    public ArticleEntity submitForReview(Long id) {
        ArticleEntity a = get(id);
        UserEntity current = SecurityUtil.requireCurrentUser();
        if (current.getRole() == Role.EDITOR && a.getAuthorId() != null
                && !a.getAuthorId().equals(current.getId())) {
            throw new ForbiddenException("Editors can only submit their own articles");
        }
        a.setStatus(ArticleStatus.REVIEW);
        auditLogService.log("ARTICLE_SUBMITTED_FOR_REVIEW", "Article", id, a.getSlug());
        return a;
    }

    @Transactional
    public ArticleEntity publish(Long id) {
        ArticleEntity a = get(id);
        UserEntity current = SecurityUtil.requireCurrentUser();
        if (current.getRole() == Role.EDITOR) {
            throw new ForbiddenException("Only Admin or Super Admin can publish articles");
        }
        if (a.getContent() == null || a.getContent().isBlank())
            throw new BadRequestException("Content is required when publishing");
        a.setStatus(ArticleStatus.PUBLISHED);
        if (a.getPublishedAt() == null) a.setPublishedAt(OffsetDateTime.now());
        auditLogService.log("ARTICLE_PUBLISHED", "Article", id, a.getSlug());
        return a;
    }

    @Transactional
    public ArticleEntity archive(Long id) {
        ArticleEntity a = get(id);
        a.setStatus(ArticleStatus.ARCHIVED);
        auditLogService.log("ARTICLE_ARCHIVED", "Article", id, a.getSlug());
        return a;
    }

    @Transactional
    public void delete(Long id) {
        ArticleEntity a = get(id);
        UserEntity current = SecurityUtil.requireCurrentUser();
        if (current.getRole() == Role.EDITOR && a.getAuthorId() != null
                && !a.getAuthorId().equals(current.getId())) {
            throw new ForbiddenException("Editors can only delete their own articles");
        }
        articleRepository.delete(a);
        auditLogService.log("ARTICLE_DELETED", "Article", id, a.getSlug());
    }

    public long count() { return articleRepository.count(); }
    public long countPublished() { return articleRepository.countByStatus(ArticleStatus.PUBLISHED); }
    public long countDraft()     { return articleRepository.countByStatus(ArticleStatus.DRAFT); }

    private HashSet<TagEntity> resolveTags(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();
        return new HashSet<>(tagRepository.findByIdIn(ids));
    }

    private void guardStatusTransition(UserEntity current, ArticleStatus from, ArticleStatus to) {
        if (current.getRole() == Role.EDITOR && to == ArticleStatus.PUBLISHED) {
            throw new ForbiddenException("Editors cannot publish articles");
        }
    }
}
