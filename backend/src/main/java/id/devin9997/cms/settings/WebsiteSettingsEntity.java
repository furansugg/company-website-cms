package id.devin9997.cms.settings;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "website_settings")
@EntityListeners(AuditingEntityListener.class)
public class WebsiteSettingsEntity {

    @Id
    private Long id;

    @Column(name = "site_name", nullable = false, length = 190)
    private String siteName;

    @Column(name = "logo_id")        private Long logoId;
    @Column(name = "favicon_id")     private Long faviconId;
    @Column(name = "primary_color", length = 16) private String primaryColor;
    @Column(name = "footer_text", length = 500) private String footerText;
    @Column(name = "contact_email", length = 190) private String contactEmail;
    @Column(name = "facebook_url", length = 255) private String facebookUrl;
    @Column(name = "instagram_url", length = 255) private String instagramUrl;
    @Column(name = "twitter_url", length = 255) private String twitterUrl;
    @Column(name = "linkedin_url", length = 255) private String linkedinUrl;
    @Column(name = "youtube_url", length = 255) private String youtubeUrl;
    @Column(name = "default_meta_title") private String defaultMetaTitle;
    @Column(name = "default_meta_description", length = 500) private String defaultMetaDescription;
    @Column(name = "og_image_id") private Long ogImageId;
    @Column(columnDefinition = "TEXT", name = "robots_txt") private String robotsTxt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public Long getLogoId() { return logoId; }
    public void setLogoId(Long logoId) { this.logoId = logoId; }
    public Long getFaviconId() { return faviconId; }
    public void setFaviconId(Long faviconId) { this.faviconId = faviconId; }
    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
    public String getFooterText() { return footerText; }
    public void setFooterText(String footerText) { this.footerText = footerText; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
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
    public String getDefaultMetaTitle() { return defaultMetaTitle; }
    public void setDefaultMetaTitle(String defaultMetaTitle) { this.defaultMetaTitle = defaultMetaTitle; }
    public String getDefaultMetaDescription() { return defaultMetaDescription; }
    public void setDefaultMetaDescription(String defaultMetaDescription) { this.defaultMetaDescription = defaultMetaDescription; }
    public Long getOgImageId() { return ogImageId; }
    public void setOgImageId(Long ogImageId) { this.ogImageId = ogImageId; }
    public String getRobotsTxt() { return robotsTxt; }
    public void setRobotsTxt(String robotsTxt) { this.robotsTxt = robotsTxt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
