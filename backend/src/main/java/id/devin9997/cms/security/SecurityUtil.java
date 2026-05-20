package id.devin9997.cms.security;

import id.devin9997.cms.common.exception.ForbiddenException;
import id.devin9997.cms.user.UserEntity;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtil {
    private SecurityUtil() {}

    public static Optional<CmsUserDetails> currentUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return Optional.empty();
        Object principal = auth.getPrincipal();
        if (principal instanceof CmsUserDetails details) return Optional.of(details);
        return Optional.empty();
    }

    public static UserEntity requireCurrentUser() {
        return currentUserDetails()
                .map(CmsUserDetails::getUser)
                .orElseThrow(() -> new ForbiddenException("Not authenticated"));
    }

    public static Long requireCurrentUserId() {
        return requireCurrentUser().getId();
    }
}
