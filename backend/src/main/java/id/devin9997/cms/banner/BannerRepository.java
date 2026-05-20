package id.devin9997.cms.banner;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BannerRepository extends JpaRepository<BannerEntity, Long> {
    List<BannerEntity> findAllByOrderBySortOrderAscIdAsc();
    List<BannerEntity> findByActiveTrueOrderBySortOrderAscIdAsc();
}
