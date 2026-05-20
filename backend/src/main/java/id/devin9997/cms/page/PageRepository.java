package id.devin9997.cms.page;

import id.devin9997.cms.common.PublishStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PageRepository extends JpaRepository<PageEntity, Long> {
    Optional<PageEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);
    Page<PageEntity> findByTitleContainingIgnoreCase(String q, Pageable pageable);
    Page<PageEntity> findByStatus(PublishStatus status, Pageable pageable);
    Page<PageEntity> findByStatusAndTitleContainingIgnoreCase(PublishStatus status, String q, Pageable pageable);
    List<PageEntity> findByStatusOrderByUpdatedAtDesc(PublishStatus status);
    long countByStatus(PublishStatus status);
}
