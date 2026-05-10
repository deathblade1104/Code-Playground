package com.bookstore.controllers;

import com.bookstore.annotations.RequireAdmin;
import com.bookstore.domain.book.Author;
import com.bookstore.dto.CreateAuthorRequest;
import com.bookstore.services.AuthorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;

    /**
     * Create a new author (admin only)
     */
    @RequireAdmin
    @PostMapping
    public ResponseEntity<Author> createAuthor(@Valid @RequestBody CreateAuthorRequest request) {
        return ResponseEntity.ok(authorService.createAuthor(request));
    }

    /**
     * Search authors by name (fuzzy matching)
     * Public endpoint - anyone can search for authors
     */
    @GetMapping("/search")
    public ResponseEntity<List<Author>> searchAuthors(
            @RequestParam(required = false) String name) {
        if (name == null || name.trim().isEmpty()) {
            // Return all authors if no search term provided
            return ResponseEntity.ok(authorService.getAllAuthors());
        }
        return ResponseEntity.ok(authorService.searchAuthors(name));
    }

    /**
     * Get all authors
     */
    @GetMapping
    public ResponseEntity<List<Author>> getAllAuthors() {
        return ResponseEntity.ok(authorService.getAllAuthors());
    }

    /**
     * Get author by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Author> getAuthorById(@PathVariable Long id) {
        return ResponseEntity.ok(authorService.getAuthorById(id));
    }
}

