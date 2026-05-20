package id.devin9997.cms.auth;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.Role;
import id.devin9997.cms.security.CmsUserDetails;
import id.devin9997.cms.security.JwtService;
import id.devin9997.cms.security.SecurityUtil;
import id.devin9997.cms.user.UserEntity;
import id.devin9997.cms.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record AuthUser(Long id, String email, String fullName, Role role) {
        static AuthUser from(UserEntity u) {
            return new AuthUser(u.getId(), u.getEmail(), u.getFullName(), u.getRole());
        }
    }

    public record LoginResponse(String token, String tokenType, long expiresInMs, AuthUser user) {}

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AuthController(AuthenticationManager authManager, JwtService jwtService,
                          UserRepository userRepository, AuditLogService auditLogService) {
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        CmsUserDetails details = (CmsUserDetails) auth.getPrincipal();
        UserEntity user = details.getUser();
        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        auditLogService.log("LOGIN", "User", user.getId(), null);
        return new LoginResponse(token, "Bearer", jwtService.getExpirationMs(), AuthUser.from(user));
    }

    @PostMapping("/logout")
    public void logout() {
        SecurityUtil.currentUserDetails()
                .ifPresent(d -> auditLogService.log("LOGOUT", "User", d.getId(), null));
        // Stateless JWT: client should drop the token.
    }

    @GetMapping("/me")
    public AuthUser me() {
        return AuthUser.from(SecurityUtil.requireCurrentUser());
    }
}
