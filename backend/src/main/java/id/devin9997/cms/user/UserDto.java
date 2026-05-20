package id.devin9997.cms.user;

import id.devin9997.cms.common.Role;
import id.devin9997.cms.common.UserStatus;
import java.time.OffsetDateTime;

public record UserDto(
        Long id,
        String email,
        String fullName,
        Role role,
        UserStatus status,
        OffsetDateTime lastLoginAt,
        OffsetDateTime createdAt
) {
    public static UserDto from(UserEntity u) {
        return new UserDto(u.getId(), u.getEmail(), u.getFullName(),
                u.getRole(), u.getStatus(), u.getLastLoginAt(), u.getCreatedAt());
    }
}
