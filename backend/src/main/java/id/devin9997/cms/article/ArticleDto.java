package id.devin9997.cms.article;

import id.devin9997.cms.common.ArticleStatus;
import id.devin9997.cms.media.MediaDto;
import id.devin9997.cms.media.MediaRepository;
import id.devin9997.cms.tag.TagEntity;
import java.time.OffsetDateTime;
import java.util.List;

public record ArticleDto(
        Long id,
        String title,
        String slug,
        String excerpt,
        String content,
        Long categoryId,
        Long authorId,
        ArticleStatus status,
        OffsetDateTime publishedAt,
        String metaTitle,
        String metaDescription,
        MediaDto featuredImage,
        List<TagDto> tags,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public record TagDto(Long id, String name, String slug) {
        static TagDto from(TagEntity t) { return new TagDto(t.getId(), t.getName(), t.getSlug()); }
    }

    public static ArticleDto from(ArticleEntity a, MediaRepository mediaRepository) {
        MediaDto image = null;
        if (a.getFeaturedImageId() != null) {
            image = mediaRepository.findById(a.getFeaturedImageId()).map(MediaDto::from).orElse(null);
        }
        return new ArticleDto(a.getId(), a.getTitle(), a.getSlug(), a.getExcerpt(), a.getContent(),
                a.getCategoryId(), a.getAuthorId(), a.getStatus(), a.getPublishedAt(),
                a.getMetaTitle(), a.getMetaDescription(), image,
                a.getTags().stream().map(TagDto::from).toList(),
                a.getCreatedAt(), a.getUpdatedAt());
    }
}
