package com.bookstore.services;

import com.bookstore.constants.OpenSearchMappings;
import com.bookstore.constants.TableNames;
import com.bookstore.domain.book.Book;
import com.bookstore.dto.SearchableBook;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.action.index.IndexRequest;
import org.opensearch.client.RequestOptions;
import org.opensearch.client.RestHighLevelClient;
import org.opensearch.client.indices.CreateIndexRequest;
import org.opensearch.client.indices.GetIndexRequest;
import org.opensearch.common.xcontent.XContentType;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenSearchService {

    private final RestHighLevelClient client;
    private final ObjectMapper objectMapper;

    @PostConstruct
    public void initializeIndex() {
        try {
            if (!indexExists()) {
                createIndex();
                log.info("Created OpenSearch index: {}", TableNames.BOOKS);
            } else {
                log.info("OpenSearch index already exists: {}", TableNames.BOOKS);
            }
        } catch (Exception e) {
            log.warn("Failed to initialize OpenSearch index (application will continue without search functionality): {}", e.getMessage());
            log.debug("OpenSearch initialization error details", e);
            // Don't throw - allow application to start even if OpenSearch is unavailable
            // Search functionality will fail gracefully when used
        }
    }

    private boolean indexExists() throws IOException {
        GetIndexRequest request = new GetIndexRequest(TableNames.BOOKS);
        return client.indices().exists(request, RequestOptions.DEFAULT);
    }

    private void createIndex() throws IOException {
        CreateIndexRequest request = new CreateIndexRequest(TableNames.BOOKS);

        // Create type-safe mapping object and serialize to JSON
        OpenSearchMappings.IndexMapping mapping = OpenSearchMappings.createBooksMapping();
        // Only serialize the mappings part, not the wrapper (CreateIndexRequest adds the wrapper)
        String mappingJson = objectMapper.writeValueAsString(mapping.getMappings());

        request.mapping(mappingJson, XContentType.JSON);
        client.indices().create(request, RequestOptions.DEFAULT);
    }

    public void indexBook(Book book) {
        try {
            // Only index searchable fields + ID for lookup
            SearchableBook searchableBook = SearchableBook.builder()
                    .id(book.getId())
                    .title(book.getTitle())
                    .description(book.getDescription())
                    .genre(book.getGenre() != null ? book.getGenre().name() : null)
                    .authorName(book.getAuthor() != null ? book.getAuthor().getName() : null)
                    .build();

            String json = objectMapper.writeValueAsString(searchableBook);
            IndexRequest request = new IndexRequest(TableNames.BOOKS)
                    .id(String.valueOf(book.getId()))
                    .source(json, XContentType.JSON);
            client.index(request, RequestOptions.DEFAULT);
            log.debug("Indexed book id={} to OpenSearch", book.getId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize book for indexing", e);
            // Don't throw - allow book creation to succeed even if indexing fails
        } catch (IOException e) {
            log.warn("Failed to index book to OpenSearch (search may not be available): {}", e.getMessage());
            log.debug("OpenSearch indexing error details", e);
            // Don't throw - allow book creation to succeed even if indexing fails
        }
    }
}
