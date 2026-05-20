package id.devin9997.cms.user;

import id.devin9997.cms.common.PageResponse;
import id.devin9997.cms.common.Role;
import id.devin9997.cms.common.UserStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    public record CreateUserRequest(
            @Email @NotBlank String email,
            @NotBlank String fullName,
            @NotBlank @Size(min = 8, max = 100) String password,
            Role role,
            UserStatus status) {}

    public record UpdateUserRequest(String fullName, Role role, UserStatus status) {}

    public record ResetPasswordRequest(@NotBlank @Size(min = 8, max = 100) String password) {}

    @GetMapping
    public PageResponse<UserDto> list(@RequestParam(required = false) String search,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, size),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(userService.list(search, pageable), UserDto::from);
    }

    @GetMapping("/{id}")
    public UserDto get(@PathVariable Long id) {
        return UserDto.from(userService.get(id));
    }

    @PostMapping
    public UserDto create(@Valid @RequestBody CreateUserRequest req) {
        return UserDto.from(userService.create(req.email(), req.fullName(), req.password(),
                req.role() == null ? Role.EDITOR : req.role(), req.status()));
    }

    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        return UserDto.from(userService.update(id, req.fullName(), req.role(), req.status()));
    }

    @PostMapping("/{id}/reset-password")
    public void resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordRequest req) {
        userService.resetPassword(id, req.password());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}
