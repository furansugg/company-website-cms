package id.devin9997.cms.message;

import id.devin9997.cms.common.MessageStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessageEntity, Long> {
    Page<ContactMessageEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<ContactMessageEntity> findByStatusOrderByCreatedAtDesc(MessageStatus status, Pageable pageable);
    List<ContactMessageEntity> findTop5ByOrderByCreatedAtDesc();
    long countByStatus(MessageStatus status);
}
