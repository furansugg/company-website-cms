package id.devin9997.cms.article;

import id.devin9997.cms.common.ArticleStatus;
import id.devin9997.cms.common.PageResponse;
import id.devin9997.cms.media.MediaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/articles")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','EDITOR')")
public class ArticleController {

    private final ArticleService articleService;
    private final MediaRepository mediaRepository;

    public ArticleController(ArticleService articleService, MediaRepository mediaRepository) {
        this.articleService = articleService;
        this.mediaRepository = mediaRepository;
    }

    public record UpsertArticleRequest(
            @NotBlank String title,
            String slug,
            String excerpt,
            String content,
            Long categoryId,
            Long featuredImageId,
            ArticleStatus status,
            String metaTitle,
            String metaDescription,
            List<Long> tagIds) {}

    @GetMapping
    public PageResponse<ArticleDto> list(@RequestParam(required = false) String search,
                                         @RequestParam(required = false) ArticleStatus status,
                                         @RequestParam(required = false) Long categoryId,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, size),
                Sort.by(Sort.Direction.DESC, "updatedAt"));
        return PageResponse.from(articleService.list(search, status, categoryId, pageable),
                a -> ArticleDto.from(a, mediaRepository));
    }

    @GetMapping("/{id}")
    public ArticleDto get(@PathVariable Long id) {
        return ArticleDto.from(articleService.get(id), mediaRepository);
    }

    @PostMapping
    public ArticleDto create(@Valid @RequestBody UpsertArticleRequest req) {
        return ArticleDto.from(articleService.create(
                req.title(), req.slug(), req.excerpt(), req.content(),
                req.categoryId(), req.featuredImageId(),
                req.status(), req.metaTitle(), req.metaDescription(), req.tagIds()), mediaRepository);
    }

    @PutMapping("/{id}")
    public ArticleDto update(@PathVariable Long id, @RequestBody UpsertArticleRequest req) {
        return ArticleDto.from(articleService.update(id,
                req.title(), req.slug(), req.excerpt(), req.content(),
                req.categoryId(), req.featuredImageId(),
                req.status(), req.metaTitle(), req.metaDescription(), req.tagIds()), mediaRepository);
    }

    @PostMapping("/{id}/submit")
    public ArticleDto submit(@PathVariable Long id) {
        return ArticleDto.from(articleService.submitForReview(id), mediaRepository);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ArticleDto publish(@PathVariable Long id) {
        return ArticleDto.from(articleService.publish(id), mediaRepository);
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ArticleDto archive(@PathVariable Long id) {
        return ArticleDto.from(articleService.archive(id), mediaRepository);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        articleService.delete(id);
    }
}
