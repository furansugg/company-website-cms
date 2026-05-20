package id.devin9997.cms.profile;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "company_profile")
@EntityListeners(AuditingEntityListener.class)
public class CompanyProfileEntity {

    @Id
    private Long id;

    @Column(nullable = false, length = 190)
    private String name;

    @Column(length = 255)
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String vision;

    @Column(columnDefinition = "TEXT")
    private String mission;

    @Column(length = 500)
    private String address;

    @Column(length = 80)
    private String phone;

    @Column(length = 190)
    private String email;

    @Column(name = "logo_id")
    private Long logoId;

    @Column(name = "facebook_url", length = 255) private String facebookUrl;
    @Column(name = "instagram_url", length = 255) private String instagramUrl;
    @Column(name = "twitter_url", length = 255) private String twitterUrl;
    @Column(name = "linkedin_url", length = 255) private String linkedinUrl;
    @Column(name = "youtube_url", length = 255) private String youtubeUrl;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getVision() { return vision; }
    public void setVision(String vision) { this.vision = vision; }
    public String getMission() { return mission; }
    public void setMission(String mission) { this.mission = mission; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Long getLogoId() { return logoId; }
    public void setLogoId(Long logoId) { this.logoId = logoId; }
    public String getFacebookUrl() { return facebookUrl; }
    public void setFacebookUrl(String facebookUrl) { this.facebookUrl = facebookUrl; }
    public String getInstagramUrl() { return instagramUrl; }
    public void setInstagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; }
    public String getTwitterUrl() { return twitterUrl; }
    public void setTwitterUrl(String twitterUrl) { this.twitterUrl = twitterUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getYoutubeUrl() { return youtubeUrl; }
    public void setYoutubeUrl(String youtubeUrl) { this.youtubeUrl = youtubeUrl; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
