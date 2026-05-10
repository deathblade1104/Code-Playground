package com.bookstore.dto;

import lombok.Data;

/**
 * DTO for presigned URL response
 */
@Data
public class PresignedUrlResponse {
    private String presignedUrl;
    private String s3Path;
    private long expirationMinutes;

    public PresignedUrlResponse(String presignedUrl, String s3Path, long expirationMinutes) {
        this.presignedUrl = presignedUrl;
        this.s3Path = s3Path;
        this.expirationMinutes = expirationMinutes;
    }
}

