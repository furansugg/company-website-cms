package id.devin9997.cms.publik;

import id.devin9997.cms.article.ArticleRepository;
import id.devin9997.cms.common.ArticleStatus;
import id.devin9997.cms.common.PublishStatus;
import id.devin9997.cms.page.PageRepository;
import id.devin9997.cms.settings.WebsiteSettingsRepository;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class SitemapController {

    private final PageRepository pageRepository;
    private final ArticleRepository articleRepository;
    private final WebsiteSettingsRepository settingsRepository;

    @Value("${app.public-site.base-url}")
    private String publicBaseUrl;

    public SitemapController(PageRepository pageRepository, ArticleRepository articleRepository,
                             WebsiteSettingsRepository settingsRepository) {
        this.pageRepository = pageRepository;
        this.articleRepository = articleRepository;
        this.settingsRepository = settingsRepository;
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        String base = publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        sb.append(url(base + "/", OffsetDateTime.now()));
        pageRepository.findByStatusOrderByUpdatedAtDesc(PublishStatus.PUBLISHED).forEach(p ->
                sb.append(url(base + "/page/" + p.getSlug(), p.getUpdatedAt())));
        articleRepository.findAll().stream()
                .filter(a -> a.getStatus() == ArticleStatus.PUBLISHED)
                .forEach(a -> sb.append(url(base + "/blog/" + a.getSlug(), a.getUpdatedAt())));
        sb.append("</urlset>\n");
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(sb.toString());
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robots() {
        String body = settingsRepository.findById(1L)
                .map(s -> s.getRobotsTxt() == null || s.getRobotsTxt().isBlank()
                        ? "User-agent: *\nAllow: /\n"
                        : s.getRobotsTxt())
                .orElse("User-agent: *\nAllow: /\n");
        return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(body);
    }

    private String url(String loc, OffsetDateTime lastMod) {
        String dt = lastMod == null ? "" : DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(lastMod);
        return "  <url>\n    <loc>" + loc + "</loc>\n"
                + (dt.isEmpty() ? "" : "    <lastmod>" + dt + "</lastmod>\n")
                + "  </url>\n";
    }
}
