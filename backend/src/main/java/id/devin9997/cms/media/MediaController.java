package id.devin9997.cms.media;

import id.devin9997.cms.common.PageResponse;
import java.io.IOException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','EDITOR')")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    public PageResponse<MediaDto> list(@RequestParam(required = false) String search,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "24") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, size));
        return PageResponse.from(mediaService.list(search, pageable), MediaDto::from);
    }

    @GetMapping("/{id}")
    public MediaDto get(@PathVariable Long id) {
        return MediaDto.from(mediaService.get(id));
    }

    @PostMapping(consumes = "multipart/form-data")
    public MediaDto upload(@RequestParam("file") MultipartFile file,
                           @RequestParam(value = "altText", required = false) String altText) throws IOException {
        return MediaDto.from(mediaService.upload(file, altText));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public void delete(@PathVariable Long id) {
        mediaService.delete(id);
    }
}
