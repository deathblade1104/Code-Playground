package com.bookstore.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

import com.bookstore.domain.book.Genre;

@Data
public class CreateBookRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 10 integer digits and 2 decimal places")
    private BigDecimal price;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock must be 0 or greater")
    private Integer stock;

    @NotNull(message = "Author ID is required")
    @Positive(message = "Author ID must be a positive number")
    private Long authorId;

    @NotNull(message = "Genre is required")
    private Genre genre;

    @NotBlank(message = "ISBN is required")
    @Pattern(regexp = "^\\d{10}|\\d{13}$", message = "ISBN must be 10 or 13 digits")
    private String isbn;

    @NotBlank(message = "S3 path is required")
    private String s3Path;
}
