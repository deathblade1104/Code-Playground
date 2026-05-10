package com.bookstore.services;

import com.bookstore.domain.book.Book;
import com.bookstore.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.action.search.SearchRequest;
import org.opensearch.action.search.SearchResponse;
import org.opensearch.client.RequestOptions;
import org.opensearch.client.RestHighLevelClient;
import org.opensearch.index.query.QueryBuilders;
import org.opensearch.search.SearchHit;
import org.opensearch.search.builder.SearchSourceBuilder;
import org.springframework.stereotype.Service;

import com.bookstore.constants.TableNames;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final RestHighLevelClient client;
    private final BookRepository bookRepository;

    /**
     * Search books in OpenSearch and return full Book objects from PostgreSQL
     * Only searchable fields (title, description, authorName) are indexed in OpenSearch
     * Preserves order from OpenSearch relevance scores
     * Falls back to empty list if OpenSearch is unavailable
     */
    public List<Book> searchBooks(String query) {
        try {
            // Search in OpenSearch to get IDs (ordered by relevance)
            List<Long> bookIds = searchBookIds(query);

            if (bookIds.isEmpty()) {
                return new ArrayList<>();
            }

            // Fetch full Book objects from PostgreSQL and preserve order
            Map<Long, Book> booksMap = bookRepository.findAllById(bookIds)
                    .stream()
                    .collect(Collectors.toMap(Book::getId, book -> book));

            // Return in same order as OpenSearch results (relevance order)
            return bookIds.stream()
                    .map(booksMap::get)
                    .filter(book -> book != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("OpenSearch unavailable or error occurred during search: {}. Returning empty results.", e.getMessage());
            log.debug("Search error details", e);
            // Return empty list instead of throwing - allows application to continue
            return new ArrayList<>();
        }
    }

    /**
     * Search OpenSearch and return only book IDs
     * This is more efficient - OpenSearch only stores searchable fields
     */
    private List<Long> searchBookIds(String query) throws IOException {
        SearchRequest req = new SearchRequest(TableNames.BOOKS);

        // Configure SearchSourceBuilder
        SearchSourceBuilder src = new SearchSourceBuilder()
                .query(QueryBuilders.multiMatchQuery(query, "title", "description", "authorName"))
                .size(100);  // Limit results
        req.source(src);

        // Note: The deprecated ignore_throttled warning comes from the client library's default behavior
        // In OpenSearch/Elasticsearch 8.15+, frozen indices are deprecated
        // The warning is harmless and doesn't affect functionality
        // The client library will be updated in future versions to remove this parameter

        SearchResponse resp = client.search(req, RequestOptions.DEFAULT);

        List<Long> ids = new ArrayList<>();
        for (SearchHit hit : resp.getHits().getHits()) {
            Map<String, Object> source = hit.getSourceAsMap();
            Object idObj = source.get("id");
            if (idObj instanceof Number) {
                ids.add(((Number) idObj).longValue());
            }
        }
        return ids;
    }
}
