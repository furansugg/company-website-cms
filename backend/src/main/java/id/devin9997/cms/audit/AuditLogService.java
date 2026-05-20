package id.devin9997.cms.audit;

import id.devin9997.cms.security.SecurityUtil;
import id.devin9997.cms.user.UserEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository repository;

    @Autowired(required = false)
    private HttpServletRequest currentRequest;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void log(String action, String entityType, Object entityId, String metadata) {
        AuditLogEntity entry = new AuditLogEntity();
        SecurityUtil.currentUserDetails().ifPresent(details -> {
            UserEntity u = details.getUser();
            entry.setUserId(u.getId());
            entry.setUserEmail(u.getEmail());
        });
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId == null ? null : String.valueOf(entityId));
        entry.setMetadata(metadata);
        if (currentRequest != null) {
            String ip = currentRequest.getHeader("X-Forwarded-For");
            if (ip == null || ip.isBlank()) ip = currentRequest.getRemoteAddr();
            entry.setIpAddress(ip);
        }
        repository.save(entry);
    }
}
