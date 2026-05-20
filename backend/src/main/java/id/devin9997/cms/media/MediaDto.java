package id.devin9997.cms.media;

import java.time.OffsetDateTime;

public record MediaDto(
        Long id,
        String fileName,
        String originalName,
        String fileType,
        Long fileSize,
        String url,
        Integer width,
        Integer height,
        String altText,
        Long uploadedBy,
        OffsetDateTime createdAt
) {
    public static MediaDto from(MediaEntity m) {
        if (m == null) return null;
        return new MediaDto(m.getId(), m.getFileName(), m.getOriginalName(), m.getFileType(),
                m.getFileSize(), m.getUrl(), m.getWidth(), m.getHeight(), m.getAltText(),
                m.getUploadedBy(), m.getCreatedAt());
    }
}
