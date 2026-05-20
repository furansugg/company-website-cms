package id.devin9997.cms.article;

import id.devin9997.cms.common.ArticleStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArticleRepository extends JpaRepository<ArticleEntity, Long> {
    Optional<ArticleEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("SELECT a FROM ArticleEntity a WHERE " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:categoryId IS NULL OR a.categoryId = :categoryId) AND " +
            "(:q = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<ArticleEntity> search(@Param("q") String q,
                               @Param("status") ArticleStatus status,
                               @Param("categoryId") Long categoryId,
                               Pageable pageable);

    Page<ArticleEntity> findByStatus(ArticleStatus status, Pageable pageable);
    List<ArticleEntity> findTop5ByStatusOrderByPublishedAtDesc(ArticleStatus status);
    long countByStatus(ArticleStatus status);
}
