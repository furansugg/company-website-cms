package id.devin9997.cms.page;

import id.devin9997.cms.common.PublishStatus;
import id.devin9997.cms.media.MediaDto;
import id.devin9997.cms.media.MediaRepository;
import java.time.OffsetDateTime;

public record PageDto(
        Long id,
        String title,
        String slug,
        String content,
        String excerpt,
        String metaTitle,
        String metaDescription,
        PublishStatus status,
        MediaDto featuredImage,
        Long createdBy,
        Long updatedBy,
        OffsetDateTime publishedAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static PageDto from(PageEntity p, MediaRepository mediaRepository) {
        MediaDto image = null;
        if (p.getFeaturedImageId() != null) {
            image = mediaRepository.findById(p.getFeaturedImageId()).map(MediaDto::from).orElse(null);
        }
        return new PageDto(p.getId(), p.getTitle(), p.getSlug(), p.getContent(), p.getExcerpt(),
                p.getMetaTitle(), p.getMetaDescription(), p.getStatus(), image,
                p.getCreatedBy(), p.getUpdatedBy(),
                p.getPublishedAt(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
