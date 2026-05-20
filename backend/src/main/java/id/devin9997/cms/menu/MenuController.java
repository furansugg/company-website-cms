package id.devin9997.cms.menu;

import id.devin9997.cms.audit.AuditLogService;
import id.devin9997.cms.common.exception.BadRequestException;
import id.devin9997.cms.common.exception.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/menus")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class MenuController {

    private final MenuRepository repository;
    private final AuditLogService auditLogService;

    public MenuController(MenuRepository repository, AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    public record MenuDto(Long id, String name, String url, Long parentId,
                          Integer sortOrder, boolean active, String target) {
        public static MenuDto from(MenuEntity m) {
            return new MenuDto(m.getId(), m.getName(), m.getUrl(), m.getParentId(),
                    m.getSortOrder(), m.isActive(), m.getTarget());
        }
    }

    public record UpsertMenuRequest(@NotBlank String name, @NotBlank String url, Long parentId,
                                    Integer sortOrder, Boolean active, String target) {}

    @GetMapping
    public List<MenuDto> list() {
        return repository.findAllByOrderBySortOrderAscIdAsc().stream().map(MenuDto::from).toList();
    }

    @PostMapping
    @Transactional
    public MenuDto create(@Valid @RequestBody UpsertMenuRequest req) {
        MenuEntity m = new MenuEntity();
        applyRequest(m, req);
        guardCircular(m);
        MenuEntity saved = repository.save(m);
        auditLogService.log("MENU_CREATED", "Menu", saved.getId(), saved.getName());
        return MenuDto.from(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public MenuDto update(@PathVariable Long id, @Valid @RequestBody UpsertMenuRequest req) {
        MenuEntity m = repository.findById(id).orElseThrow(() -> new NotFoundException("Menu not found: " + id));
        applyRequest(m, req);
        if (req.parentId() != null && req.parentId().equals(id))
            throw new BadRequestException("Menu cannot be its own parent");
        guardCircular(m);
        auditLogService.log("MENU_UPDATED", "Menu", id, m.getName());
        return MenuDto.from(m);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        MenuEntity m = repository.findById(id).orElseThrow(() -> new NotFoundException("Menu not found: " + id));
        repository.delete(m);
        auditLogService.log("MENU_DELETED", "Menu", id, m.getName());
    }

    private void applyRequest(MenuEntity m, UpsertMenuRequest req) {
        m.setName(req.name().trim());
        m.setUrl(req.url().trim());
        m.setParentId(req.parentId() == null || req.parentId() == 0 ? null : req.parentId());
        if (req.sortOrder() != null) m.setSortOrder(req.sortOrder());
        if (req.active() != null) m.setActive(req.active());
        if (req.target() != null) {
            if (!"_self".equals(req.target()) && !"_blank".equals(req.target()))
                throw new BadRequestException("Target must be _self or _blank");
            m.setTarget(req.target());
        }
    }

    private void guardCircular(MenuEntity m) {
        if (m.getParentId() == null) return;
        Set<Long> seen = new HashSet<>();
        if (m.getId() != null) seen.add(m.getId());
        Long currentParentId = m.getParentId();
        while (currentParentId != null) {
            if (!seen.add(currentParentId))
                throw new BadRequestException("Circular menu parent detected");
            Long parentId = currentParentId;
            currentParentId = repository.findById(currentParentId).map(MenuEntity::getParentId).orElse(null);
            if (currentParentId != null && parentId.equals(currentParentId)) break;
        }
    }
}
