package id.devin9997.cms.media;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.exception.BadRequestException;
import id.devin9997.cms.common.exception.NotFoundException;
import id.devin9997.cms.security.SecurityUtil;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MediaService {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM");

    private final MediaRepository repository;
    private final AuditLogService auditLogService;
    private final Path storageRoot;
    private final String publicBaseUrl;
    private final long maxBytes;
    private final Set<String> allowedTypes;

    public MediaService(MediaRepository repository,
                        AuditLogService auditLogService,
                        @Value("${app.storage.root}") String storageRoot,
                        @Value("${app.storage.public-base-url}") String publicBaseUrl,
                        @Value("${app.storage.max-bytes}") long maxBytes,
                        @Value("${app.storage.allowed-image-types}") String allowedImages,
                        @Value("${app.storage.allowed-document-types}") String allowedDocs) throws IOException {
        this.repository = repository;
        this.auditLogService = auditLogService;
        this.storageRoot = Paths.get(storageRoot).toAbsolutePath();
        Files.createDirectories(this.storageRoot);
        this.publicBaseUrl = publicBaseUrl.endsWith("/")
                ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
                : publicBaseUrl;
        this.maxBytes = maxBytes;
        this.allowedTypes = new java.util.HashSet<>();
        for (String t : (allowedImages + "," + allowedDocs).split(",")) {
            if (!t.isBlank()) this.allowedTypes.add(t.trim().toLowerCase(Locale.ROOT));
        }
    }

    @Transactional
    public MediaEntity upload(MultipartFile file, String altText) throws IOException {
        if (file == null || file.isEmpty()) throw new BadRequestException("File is required");
        if (file.getSize() > maxBytes) throw new BadRequestException("File too large");
        String contentType = file.getContentType() == null
                ? "application/octet-stream"
                : file.getContentType().toLowerCase(Locale.ROOT);
        if (!allowedTypes.contains(contentType)) {
            throw new BadRequestException("Unsupported file type: " + contentType);
        }
        String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        String safeName = originalName.replaceAll("[^A-Za-z0-9._-]", "_");
        String storedName = UUID.randomUUID() + "_" + safeName;
        String subDir = LocalDate.now().format(MONTH_FORMAT);
        Path targetDir = storageRoot.resolve(subDir);
        Files.createDirectories(targetDir);
        Path target = targetDir.resolve(storedName);
        try (var in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        MediaEntity entity = new MediaEntity();
        entity.setFileName(storedName);
        entity.setOriginalName(originalName);
        entity.setFileType(contentType);
        entity.setFileSize(file.getSize());
        entity.setFilePath(target.toString());
        entity.setUrl(publicBaseUrl + "/" + subDir + "/" + storedName);
        entity.setAltText(altText);
        SecurityUtil.currentUserDetails().ifPresent(d -> entity.setUploadedBy(d.getId()));
        MediaEntity saved = repository.save(entity);
        auditLogService.log("MEDIA_UPLOADED", "Media", saved.getId(), originalName);
        return saved;
    }

    @Transactional(readOnly = true)
    public MediaEntity get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Media not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<MediaEntity> list(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return repository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return repository.findByOriginalNameContainingIgnoreCaseOrderByCreatedAtDesc(search.trim(), pageable);
    }

    @Transactional
    public void delete(Long id) {
        MediaEntity media = get(id);
        try {
            Files.deleteIfExists(Paths.get(media.getFilePath()));
        } catch (IOException ignored) {
            // best-effort filesystem cleanup
        }
        repository.delete(media);
        auditLogService.log("MEDIA_DELETED", "Media", id, media.getOriginalName());
    }
}
