package id.devin9997.cms.service;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    Optional<ServiceEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<ServiceEntity> findAllByOrderBySortOrderAscIdAsc();
    List<ServiceEntity> findByActiveTrueOrderBySortOrderAscIdAsc();
}
