package com.bookstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAuthorRequest {
    @NotBlank(message = "Author name is required")
    @Size(min = 2, max = 200, message = "Author name must be between 2 and 200 characters")
    private String name;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;
}

