package id.devin9997.cms.audit;

import id.devin9997.cms.common.PageResponse;
import java.time.OffsetDateTime;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AuditLogController {

    private final AuditLogRepository repository;

    public AuditLogController(AuditLogRepository repository) {
        this.repository = repository;
    }

    public record AuditLogDto(Long id, Long userId, String userEmail, String action,
                              String entityType, String entityId, String metadata,
                              String ipAddress, OffsetDateTime createdAt) {
        static AuditLogDto from(AuditLogEntity e) {
            return new AuditLogDto(e.getId(), e.getUserId(), e.getUserEmail(),
                    e.getAction(), e.getEntityType(), e.getEntityId(),
                    e.getMetadata(), e.getIpAddress(), e.getCreatedAt());
        }
    }

    @GetMapping
    public PageResponse<AuditLogDto> list(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, size));
        return PageResponse.from(repository.findAllByOrderByCreatedAtDesc(pageable), AuditLogDto::from);
    }
}
