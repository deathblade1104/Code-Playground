package com.bookstore.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for requesting a presigned URL for file upload
 */
@Data
public class PresignedUrlRequest {
    @NotBlank(message = "File name is required")
    private String fileName;
}

