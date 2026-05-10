package com.bookstore.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO for OpenSearch indexing - contains only searchable fields
 * Full book data is stored in PostgreSQL and retrieved via ID lookup
 */
@Data
@Builder
public class SearchableBook {
    private Long id;
    private String title;
    private String description;
    private String genre;  
    private String authorName;  // For searching books by author
}

