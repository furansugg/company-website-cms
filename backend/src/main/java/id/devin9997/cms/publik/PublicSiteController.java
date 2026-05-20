package id.devin9997.cms.publik;

import id.devin9997.cms.article.ArticleDto;
import id.devin9997.cms.article.ArticleEntity;
import id.devin9997.cms.article.ArticleRepository;
import id.devin9997.cms.banner.BannerController.BannerDto;
import id.devin9997.cms.banner.BannerRepository;
import id.devin9997.cms.category.CategoryEntity;
import id.devin9997.cms.category.CategoryRepository;
import id.devin9997.cms.common.ArticleStatus;
import id.devin9997.cms.common.MessageStatus;
import id.devin9997.cms.common.PageResponse;
import id.devin9997.cms.common.PublishStatus;
import id.devin9997.cms.common.exception.NotFoundException;
import id.devin9997.cms.media.MediaRepository;
import id.devin9997.cms.menu.MenuController.MenuDto;
import id.devin9997.cms.menu.MenuRepository;
import id.devin9997.cms.message.ContactMessageEntity;
import id.devin9997.cms.message.ContactMessageRepository;
import id.devin9997.cms.page.PageDto;
import id.devin9997.cms.page.PageRepository;
import id.devin9997.cms.profile.CompanyProfileController.CompanyProfileDto;
import id.devin9997.cms.profile.CompanyProfileRepository;
import id.devin9997.cms.service.ServiceController.ServiceDto;
import id.devin9997.cms.service.ServiceEntity;
import id.devin9997.cms.service.ServiceRepository;
import id.devin9997.cms.settings.WebsiteSettingsController.WebsiteSettingsDto;
import id.devin9997.cms.settings.WebsiteSettingsRepository;
import id.devin9997.cms.tag.TagEntity;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class PublicSiteController {

    private final PageRepository pageRepository;
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;
    private final BannerRepository bannerRepository;
    private final MenuRepository menuRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final WebsiteSettingsRepository settingsRepository;
    private final ContactMessageRepository messageRepository;
    private final MediaRepository mediaRepository;

    public PublicSiteController(PageRepository pageRepository, ArticleRepository articleRepository,
                                CategoryRepository categoryRepository, ServiceRepository serviceRepository,
                                BannerRepository bannerRepository, MenuRepository menuRepository,
                                CompanyProfileRepository companyProfileRepository,
                                WebsiteSettingsRepository settingsRepository,
                                ContactMessageRepository messageRepository,
                                MediaRepository mediaRepository) {
        this.pageRepository = pageRepository;
        this.articleRepository = articleRepository;
        this.categoryRepository = categoryRepository;
        this.serviceRepository = serviceRepository;
        this.bannerRepository = bannerRepository;
        this.menuRepository = menuRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.settingsRepository = settingsRepository;
        this.messageRepository = messageRepository;
        this.mediaRepository = mediaRepository;
    }

    public record CategoryDto(Long id, String name, String slug, String description) {
        static CategoryDto from(CategoryEntity c) {
            return new CategoryDto(c.getId(), c.getName(), c.getSlug(), c.getDescription());
        }
    }

    public record SiteSummary(WebsiteSettingsDto settings,
                              CompanyProfileDto profile,
                              List<MenuDto> menus) {}

    public record ContactSubmitRequest(@NotBlank String name,
                                       @Email @NotBlank String email,
                                       String phone,
                                       @NotBlank String subject,
                                       @NotBlank String message) {}

    @GetMapping("/site")
    public SiteSummary site() {
        var settings = settingsRepository.findById(1L)
                .map(s -> WebsiteSettingsDto.from(s, mediaRepository))
                .orElseThrow(() -> new NotFoundException("Website settings not initialized"));
        var profile = companyProfileRepository.findById(1L)
                .map(p -> CompanyProfileDto.from(p, mediaRepository))
                .orElseThrow(() -> new NotFoundException("Company profile not initialized"));
        var menus = menuRepository.findByActiveTrueOrderBySortOrderAscIdAsc().stream()
                .map(MenuDto::from).toList();
        return new SiteSummary(settings, profile, menus);
    }

    @GetMapping("/pages/{slug}")
    public PageDto page(@PathVariable String slug) {
        var page = pageRepository.findBySlug(slug)
                .filter(p -> p.getStatus() == PublishStatus.PUBLISHED)
                .orElseThrow(() -> new NotFoundException("Page not found: " + slug));
        return PageDto.from(page, mediaRepository);
    }

    @GetMapping("/pages")
    public List<PageDto> pages() {
        return pageRepository.findByStatusOrderByUpdatedAtDesc(PublishStatus.PUBLISHED).stream()
                .map(p -> PageDto.from(p, mediaRepository)).toList();
    }

    @GetMapping("/articles")
    public PageResponse<ArticleDto> articles(@RequestParam(required = false) String search,
                                             @RequestParam(required = false) Long categoryId,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "9") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(48, size),
                Sort.by(Sort.Direction.DESC, "publishedAt"));
        return PageResponse.from(
                articleRepository.search(search == null ? "" : search.trim(),
                        ArticleStatus.PUBLISHED, categoryId, pageable),
                a -> ArticleDto.from(a, mediaRepository));
    }

    @GetMapping("/articles/{slug}")
    public ArticleDto article(@PathVariable String slug) {
        ArticleEntity article = articleRepository.findBySlug(slug)
                .filter(a -> a.getStatus() == ArticleStatus.PUBLISHED)
                .orElseThrow(() -> new NotFoundException("Article not found: " + slug));
        return ArticleDto.from(article, mediaRepository);
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return categoryRepository.findAll().stream().map(CategoryDto::from).toList();
    }

    @GetMapping("/services")
    public List<ServiceDto> services() {
        return serviceRepository.findByActiveTrueOrderBySortOrderAscIdAsc().stream()
                .map((ServiceEntity s) -> ServiceDto.from(s, mediaRepository)).toList();
    }

    @GetMapping("/services/{slug}")
    public ServiceDto service(@PathVariable String slug) {
        ServiceEntity service = serviceRepository.findBySlug(slug)
                .filter(ServiceEntity::isActive)
                .orElseThrow(() -> new NotFoundException("Service not found: " + slug));
        return ServiceDto.from(service, mediaRepository);
    }

    @GetMapping("/banners")
    public List<BannerDto> banners() {
        return bannerRepository.findByActiveTrueOrderBySortOrderAscIdAsc().stream()
                .map(b -> BannerDto.from(b, mediaRepository)).toList();
    }

    @PostMapping("/contact")
    public ContactSubmitResponse submitContact(@Valid @RequestBody ContactSubmitRequest req,
                                               HttpServletRequest request) {
        ContactMessageEntity m = new ContactMessageEntity();
        m.setName(req.name().trim());
        m.setEmail(req.email().trim());
        m.setPhone(req.phone());
        m.setSubject(req.subject().trim());
        m.setMessage(req.message());
        m.setStatus(MessageStatus.UNREAD);
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        m.setIpAddress(ip);
        m.setUserAgent(request.getHeader("User-Agent"));
        messageRepository.save(m);
        return new ContactSubmitResponse(true, "Pesan Anda telah terkirim. Terima kasih.");
    }

    public record ContactSubmitResponse(boolean success, String message) {}

    @GetMapping("/search")
    public SearchResponse search(@RequestParam(name = "q") String q) {
        if (q == null) q = "";
        String query = q.trim();
        Pageable top = PageRequest.of(0, 12, Sort.by(Sort.Direction.DESC, "publishedAt"));
        var articles = articleRepository.search(query, ArticleStatus.PUBLISHED, null, top)
                .map(a -> ArticleDto.from(a, mediaRepository))
                .getContent();
        var pages = pageRepository
                .findByStatusAndTitleContainingIgnoreCase(PublishStatus.PUBLISHED, query,
                        PageRequest.of(0, 12, Sort.by(Sort.Direction.DESC, "updatedAt")))
                .map(p -> PageDto.from(p, mediaRepository))
                .getContent();
        return new SearchResponse(query, articles, pages);
    }

    public record SearchResponse(String query, List<ArticleDto> articles, List<PageDto> pages) {}

    @GetMapping("/article-tags")
    public List<String> articleTags(@RequestParam Long articleId) {
        return articleRepository.findById(articleId)
                .map(a -> a.getTags().stream().map(TagEntity::getName).toList())
                .orElseThrow(() -> new NotFoundException("Article not found"));
    }
}
