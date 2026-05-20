package id.devin9997.cms;

import static org.assertj.core.api.Assertions.assertThat;

import id.devin9997.cms.auth.AuthController;
import id.devin9997.cms.profile.CompanyProfileEntity;
import id.devin9997.cms.profile.CompanyProfileRepository;
import id.devin9997.cms.settings.WebsiteSettingsEntity;
import id.devin9997.cms.settings.WebsiteSettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class CmsApplicationTests {

    @LocalServerPort
    int port;

    @Autowired TestRestTemplate restTemplate;
    @Autowired CompanyProfileRepository profileRepository;
    @Autowired WebsiteSettingsRepository settingsRepository;

    @BeforeEach
    void initSingletons() {
        if (profileRepository.findById(1L).isEmpty()) {
            CompanyProfileEntity p = new CompanyProfileEntity();
            p.setId(1L);
            p.setName("Test Company");
            profileRepository.save(p);
        }
        if (settingsRepository.findById(1L).isEmpty()) {
            WebsiteSettingsEntity s = new WebsiteSettingsEntity();
            s.setId(1L);
            s.setSiteName("Test Site");
            settingsRepository.save(s);
        }
    }

    @Test
    void contextLoadsAndDefaultUserCanLogin() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"email\":\"super.admin@example.com\",\"password\":\"Admin123!\"}";
        ResponseEntity<AuthController.LoginResponse> response = restTemplate.exchange(
                "http://localhost:" + port + "/api/auth/login",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                AuthController.LoginResponse.class);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().token()).isNotBlank();
    }
}
