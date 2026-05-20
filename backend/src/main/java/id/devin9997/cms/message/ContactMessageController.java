package id.devin9997.cms.message;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.MessageStatus;
import id.devin9997.cms.common.PageResponse;
import id.devin9997.cms.common.exception.NotFoundException;
import java.time.OffsetDateTime;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/messages")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class ContactMessageController {

    private final ContactMessageRepository repository;
    private final AuditLogService auditLogService;

    public ContactMessageController(ContactMessageRepository repository, AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    public record MessageDto(Long id, String name, String email, String phone, String subject,
                             String message, MessageStatus status, OffsetDateTime createdAt) {
        public static MessageDto from(ContactMessageEntity m) {
            return new MessageDto(m.getId(), m.getName(), m.getEmail(), m.getPhone(), m.getSubject(),
                    m.getMessage(), m.getStatus(), m.getCreatedAt());
        }
    }

    public record StatusUpdate(MessageStatus status) {}

    @GetMapping
    public PageResponse<MessageDto> list(@RequestParam(required = false) MessageStatus status,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, size));
        var pageData = (status == null)
                ? repository.findAllByOrderByCreatedAtDesc(pageable)
                : repository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return PageResponse.from(pageData, MessageDto::from);
    }

    @GetMapping("/{id}")
    public MessageDto get(@PathVariable Long id) {
        ContactMessageEntity m = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Message not found: " + id));
        if (m.getStatus() == MessageStatus.UNREAD) {
            m.setStatus(MessageStatus.READ);
            repository.save(m);
        }
        return MessageDto.from(m);
    }

    @PatchMapping("/{id}/status")
    public MessageDto changeStatus(@PathVariable Long id, @RequestBody StatusUpdate req) {
        ContactMessageEntity m = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Message not found: " + id));
        m.setStatus(req.status());
        auditLogService.log("MESSAGE_STATUS_" + req.status().name(), "Message", id, null);
        return MessageDto.from(repository.save(m));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        ContactMessageEntity m = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Message not found: " + id));
        repository.delete(m);
        auditLogService.log("MESSAGE_DELETED", "Message", id, null);
    }
}
