package id.devin9997.cms.tag;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<TagEntity, Long> {
    Optional<TagEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<TagEntity> findByIdIn(List<Long> ids);
}
