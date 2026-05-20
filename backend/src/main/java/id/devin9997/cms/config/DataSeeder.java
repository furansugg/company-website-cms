package id.devin9997.cms.config;

import id.devin9997.cms.article.ArticleEntity;
import id.devin9997.cms.article.ArticleRepository;
import id.devin9997.cms.common.Role;
import id.devin9997.cms.common.UserStatus;
import id.devin9997.cms.page.PageEntity;
import id.devin9997.cms.page.PageRepository;
import id.devin9997.cms.user.UserEntity;
import id.devin9997.cms.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PageRepository pageRepository;
    private final ArticleRepository articleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      PageRepository pageRepository,
                      ArticleRepository articleRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.pageRepository = pageRepository;
        this.articleRepository = articleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        UserEntity superAdmin = ensureUser("super.admin@example.com", "Super Admin", "Admin123!", Role.SUPER_ADMIN);
        UserEntity admin      = ensureUser("admin@example.com",       "Site Admin",  "Admin123!", Role.ADMIN);
        UserEntity editor     = ensureUser("editor@example.com",      "Site Editor", "Editor123!", Role.EDITOR);

        for (PageEntity p : pageRepository.findAll()) {
            if (p.getCreatedBy() == null) p.setCreatedBy(superAdmin.getId());
            if (p.getUpdatedBy() == null) p.setUpdatedBy(superAdmin.getId());
        }
        for (ArticleEntity a : articleRepository.findAll()) {
            if (a.getAuthorId() == null) a.setAuthorId(admin.getId());
        }
        log.info("DataSeeder finished. Default users: super.admin@example.com / Admin123!, admin@example.com / Admin123!, editor@example.com / Editor123!");
    }

    private UserEntity ensureUser(String email, String fullName, String rawPassword, Role role) {
        return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            UserEntity u = new UserEntity();
            u.setEmail(email);
            u.setFullName(fullName);
            u.setPasswordHash(passwordEncoder.encode(rawPassword));
            u.setRole(role);
            u.setStatus(UserStatus.ACTIVE);
            return userRepository.save(u);
        });
    }
}
