package id.devin9997.cms.media;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<MediaEntity, Long> {
    Page<MediaEntity> findByOriginalNameContainingIgnoreCaseOrderByCreatedAtDesc(String q, Pageable pageable);
    Page<MediaEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
