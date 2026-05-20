package id.devin9997.cms.user;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.Role;
import id.devin9997.cms.common.UserStatus;
import id.devin9997.cms.common.exception.ConflictException;
import id.devin9997.cms.common.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<UserEntity> list(String search, Pageable pageable) {
        String q = search == null ? "" : search.trim();
        if (q.isEmpty()) return userRepository.findAll(pageable);
        return userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(q, q, pageable);
    }

    @Transactional(readOnly = true)
    public UserEntity get(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    @Transactional
    public UserEntity create(String email, String fullName, String password, Role role, UserStatus status) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email already used");
        }
        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setStatus(status == null ? UserStatus.ACTIVE : status);
        UserEntity saved = userRepository.save(user);
        auditLogService.log("USER_CREATED", "User", saved.getId(), saved.getEmail());
        return saved;
    }

    @Transactional
    public UserEntity update(Long id, String fullName, Role role, UserStatus status) {
        UserEntity user = get(id);
        if (fullName != null) user.setFullName(fullName);
        if (role != null) user.setRole(role);
        if (status != null) user.setStatus(status);
        auditLogService.log("USER_UPDATED", "User", id, null);
        return userRepository.save(user);
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        UserEntity user = get(id);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        auditLogService.log("USER_PASSWORD_RESET", "User", id, null);
    }

    @Transactional
    public void delete(Long id) {
        UserEntity user = get(id);
        userRepository.delete(user);
        auditLogService.log("USER_DELETED", "User", id, user.getEmail());
    }
}
