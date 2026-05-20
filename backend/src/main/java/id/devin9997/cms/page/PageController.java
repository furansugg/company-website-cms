package id.devin9997.cms.page;

import id.devin9997.cms.common.PageResponse;
import id.devin9997.cms.common.PublishStatus;
import id.devin9997.cms.media.MediaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/pages")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class PageController {

    private final PageService pageService;
    private final MediaRepository mediaRepository;

    public PageController(PageService pageService, MediaRepository mediaRepository) {
        this.pageService = pageService;
        this.mediaRepository = mediaRepository;
    }

    public record UpsertPageRequest(
            @NotBlank String title,
            String slug,
            String content,
            String excerpt,
            String metaTitle,
            String metaDescription,
            PublishStatus status,
            Long featuredImageId) {}

    public record StatusUpdate(PublishStatus status) {}

    @GetMapping
    public PageResponse<PageDto> list(@RequestParam(required = false) String search,
                                      @RequestParam(required = false) PublishStatus status,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, size),
                Sort.by(Sort.Direction.DESC, "updatedAt"));
        return PageResponse.from(pageService.list(search, status, pageable),
                p -> PageDto.from(p, mediaRepository));
    }

    @GetMapping("/{id}")
    public PageDto get(@PathVariable Long id) {
        return PageDto.from(pageService.get(id), mediaRepository);
    }

    @PostMapping
    public PageDto create(@Valid @RequestBody UpsertPageRequest req) {
        return PageDto.from(pageService.create(req.title(), req.slug(), req.content(), req.excerpt(),
                req.metaTitle(), req.metaDescription(), req.status(), req.featuredImageId()), mediaRepository);
    }

    @PutMapping("/{id}")
    public PageDto update(@PathVariable Long id, @RequestBody UpsertPageRequest req) {
        return PageDto.from(pageService.update(id, req.title(), req.slug(), req.content(), req.excerpt(),
                req.metaTitle(), req.metaDescription(), req.status(), req.featuredImageId()), mediaRepository);
    }

    @PatchMapping("/{id}/status")
    public PageDto changeStatus(@PathVariable Long id, @RequestBody StatusUpdate req) {
        return PageDto.from(pageService.changeStatus(id, req.status()), mediaRepository);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        pageService.delete(id);
    }
}
