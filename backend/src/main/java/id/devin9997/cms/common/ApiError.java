package id.devin9997.cms.common;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiError(
        int status,
        String error,
        String message,
        String path,
        List<FieldViolation> fieldErrors,
        OffsetDateTime timestamp
) {
    public record FieldViolation(String field, String message) {}
}
