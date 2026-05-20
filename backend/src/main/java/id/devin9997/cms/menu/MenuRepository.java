package id.devin9997.cms.menu;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<MenuEntity, Long> {
    List<MenuEntity> findAllByOrderBySortOrderAscIdAsc();
    List<MenuEntity> findByActiveTrueOrderBySortOrderAscIdAsc();
}
