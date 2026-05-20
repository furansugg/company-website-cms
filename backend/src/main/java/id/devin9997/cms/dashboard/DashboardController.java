package id.devin9997.cms.dashboard;

import id.devin9997.cms.article.ArticleDto;
import id.devin9997.cms.article.ArticleRepository;
import id.devin9997.cms.common.ArticleStatus;
import id.devin9997.cms.common.MessageStatus;
import id.devin9997.cms.common.PublishStatus;
import id.devin9997.cms.media.MediaRepository;
import id.devin9997.cms.message.ContactMessageController.MessageDto;
import id.devin9997.cms.message.ContactMessageRepository;
import id.devin9997.cms.page.PageRepository;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','EDITOR')")
public class DashboardController {

    private final PageRepository pageRepository;
    private final ArticleRepository articleRepository;
    private final ContactMessageRepository messageRepository;
    private final MediaRepository mediaRepository;

    public DashboardController(PageRepository pageRepository, ArticleRepository articleRepository,
                               ContactMessageRepository messageRepository, MediaRepository mediaRepository) {
        this.pageRepository = pageRepository;
        this.articleRepository = articleRepository;
        this.messageRepository = messageRepository;
        this.mediaRepository = mediaRepository;
    }

    public record DashboardStats(
            long totalPages, long publishedPages, long draftPages,
            long totalArticles, long publishedArticles, long draftArticles,
            long totalMessages, long unreadMessages,
            long totalMedia,
            List<ArticleDto> recentArticles,
            List<MessageDto> recentMessages) {}

    @GetMapping
    public DashboardStats stats() {
        long totalPages       = pageRepository.count();
        long publishedPages   = pageRepository.countByStatus(PublishStatus.PUBLISHED);
        long draftPages       = pageRepository.countByStatus(PublishStatus.DRAFT);
        long totalArticles    = articleRepository.count();
        long publishedArticles = articleRepository.countByStatus(ArticleStatus.PUBLISHED);
        long draftArticles    = articleRepository.countByStatus(ArticleStatus.DRAFT);
        long totalMessages    = messageRepository.count();
        long unreadMessages   = messageRepository.countByStatus(MessageStatus.UNREAD);
        long totalMedia       = mediaRepository.count();

        var recent = articleRepository.findTop5ByStatusOrderByPublishedAtDesc(ArticleStatus.PUBLISHED).stream()
                .map(a -> ArticleDto.from(a, mediaRepository)).toList();
        var recentMsgs = messageRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(MessageDto::from).toList();

        return new DashboardStats(totalPages, publishedPages, draftPages,
                totalArticles, publishedArticles, draftArticles,
                totalMessages, unreadMessages, totalMedia,
                recent, recentMsgs);
    }
}
