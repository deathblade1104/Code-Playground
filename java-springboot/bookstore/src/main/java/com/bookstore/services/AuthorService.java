package com.bookstore.services;

import com.bookstore.domain.book.Author;
import com.bookstore.dto.CreateAuthorRequest;
import com.bookstore.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorService {

    private final AuthorRepository authorRepository;

    /**
     * Create a new author (admin only)
     * If author with same name already exists (case-insensitive), returns existing author (idempotent)
     */
    @Transactional
    public Author createAuthor(CreateAuthorRequest request) {
        // Check if author with exact name already exists (case-insensitive)
        // This makes the operation idempotent - creating same author twice returns existing
        return authorRepository.findByNameIgnoreCase(request.getName())
                .map(existing -> {
                    log.info("Author '{}' already exists (ID: {}), returning existing author",
                            existing.getName(), existing.getId());
                    return existing;
                })
                .orElseGet(() -> {
                    // Author doesn't exist, create new one
                    Author author = Author.builder()
                            .name(request.getName())
                            .bio(request.getBio())
                            .build();

                    Author saved = authorRepository.save(author);
                    log.info("Created new author: {} (ID: {})", saved.getName(), saved.getId());
                    return saved;
                });
    }

    /**
     * Search authors by name with fuzzy matching
     * First tries exact/partial match, then falls back to fuzzy similarity search
     */
    @Transactional(readOnly = true)
    public List<Author> searchAuthors(String name) {
        if (name == null || name.trim().isEmpty()) {
            return authorRepository.findAll();
        }

        String searchTerm = name.trim();

        // First try standard search (faster)
        List<Author> results = authorRepository.searchByName(searchTerm);

        // If no results and search term is long enough, try fuzzy search
        if (results.isEmpty() && searchTerm.length() >= 3) {
            try {
                results = authorRepository.fuzzySearchByName(searchTerm);
                log.debug("Used fuzzy search for author: {}", searchTerm);
            } catch (Exception e) {
                // PostgreSQL pg_trgm extension might not be available
                log.debug("Fuzzy search not available, using standard search: {}", e.getMessage());
                // Fall back to standard search
                results = authorRepository.searchByName(searchTerm);
            }
        }

        return results;
    }

    /**
     * Get all authors
     */
    @Transactional(readOnly = true)
    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    /**
     * Get author by ID
     */
    @Transactional(readOnly = true)
    public Author getAuthorById(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Author not found"));
    }
}

