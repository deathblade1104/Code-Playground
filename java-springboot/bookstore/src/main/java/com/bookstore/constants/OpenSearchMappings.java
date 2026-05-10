package com.bookstore.constants;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * OpenSearch index mappings - Type-safe Java representation
 */
public class OpenSearchMappings {

    /**
     * Creates the mapping for books index in OpenSearch
     * Contains only searchable fields: id, title, description, genre, authorName
     */
    public static IndexMapping createBooksMapping() {
        return IndexMapping.builder()
                .mappings(Mappings.builder()
                        .properties(Map.of(
                                "id", Property.builder()
                                        .type("long")
                                        .build(),
                                "title", Property.builder()
                                        .type("text")
                                        .analyzer("standard")
                                        .fields(Map.of(
                                                "keyword", Property.builder()
                                                        .type("keyword")
                                                        .build(),
                                                "suggest", Property.builder()
                                                        .type("completion")
                                                        .build()
                                        ))
                                        .build(),
                                "description", Property.builder()
                                        .type("text")
                                        .analyzer("standard")
                                        .build(),
                                "genre", Property.builder()
                                        .type("keyword")
                                        .build(),
                                "authorName", Property.builder()
                                        .type("text")
                                        .analyzer("standard")
                                        .fields(Map.of(
                                                "keyword", Property.builder()
                                                        .type("keyword")
                                                        .build()
                                        ))
                                        .build()
                        ))
                        .build())
                .build();
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class IndexMapping {
        private Mappings mappings;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Mappings {
        private Map<String, Property> properties;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Property {
        private String type;
        private String analyzer;
        private Map<String, Property> fields;
    }
}
