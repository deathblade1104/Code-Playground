package com.bookstore.controllers;

import com.bookstore.annotations.RequireAdmin;
import com.bookstore.domain.book.Book;
import com.bookstore.dto.CreateBookRequest;
import com.bookstore.dto.PresignedUrlRequest;
import com.bookstore.dto.PresignedUrlResponse;
import com.bookstore.repository.BookRepository;
import com.bookstore.services.BookService;
import com.bookstore.services.BloomFilterService;
import com.bookstore.services.S3Service;
import com.bookstore.services.SearchService;
import com.bookstore.utils.SecurityUtils;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final SearchService searchService;
    private final S3Service s3Service;
    private final BloomFilterService bloomFilterService;
    private final BookRepository bookRepository;

    @Value("${aws.s3.presigned-url-expiration-minutes:15}")
    private long expirationMinutes;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<Book>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean includeOutOfStock) {

        // Only admins can see out-of-stock books
        boolean showAll = includeOutOfStock && SecurityUtils.isAdmin();

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(bookService.getAllBooks(pageable, showAll));
    }

    @RequireAdmin
    @PostMapping
    public ResponseEntity<Book> createBook(@Valid @RequestBody CreateBookRequest request) {
        return ResponseEntity.ok(bookService.createBook(request));
    }

    @RequireAdmin
    @PatchMapping("/{bookId}/stock")
    public ResponseEntity<Book> updateStock(
            @PathVariable Long bookId,
            @RequestParam int delta
    ) {
        return ResponseEntity.ok(bookService.updateStock(bookId, delta));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(
            @RequestParam @NotBlank(message = "Search query is required") String query) {
        return ResponseEntity.ok(searchService.searchBooks(query));
    }

    /**
     * Generate presigned URL for uploading book cover
     * Returns both presigned URL and S3 key/path
     */

    @RequireAdmin
    @PostMapping("/covers/upload")
    public ResponseEntity<PresignedUrlResponse> uploadBookCover(
            @Valid @RequestBody PresignedUrlRequest request) {
        String presignedUrl = s3Service.generatePresignedPutUrl(request.getFileName());
        String s3Path = s3Service.getS3Path(request.getFileName());
        return ResponseEntity.ok(new PresignedUrlResponse(presignedUrl, s3Path, expirationMinutes));
    }

    /**
     * Check if ISBN exists using Bloom filter with database verification
     * Handles false positives by checking database when Bloom filter says might exist
     */
    @RequireAdmin
    @GetMapping("/isbn/check")
    public ResponseEntity<Map<String, Object>> checkIsbn(
            @RequestParam @NotBlank(message = "ISBN is required")
            @Pattern(regexp = "^\\d{10}|\\d{13}$", message = "ISBN must be 10 or 13 digits") String isbn) {

        String normalizedIsbn = isbn.replaceAll("[^0-9]", "");

        // Step 1: Check Bloom filter (fast check)
        boolean mightExist = bloomFilterService.mightContain(normalizedIsbn);

        // Step 2: If Bloom filter says might exist, verify against database (handles false positives)
        boolean actuallyExists = false;
        if (mightExist) {
            actuallyExists = bookRepository.findByIsbn(normalizedIsbn).isPresent();
        }

        // Step 3: Check Redis set (definitive check without DB query)
        boolean definitelyExists = bloomFilterService.definitelyExists(normalizedIsbn);

        // If Bloom filter says might exist but DB check says no, it's a false positive
        boolean isFalsePositive = mightExist && !actuallyExists && !definitelyExists;

        Map<String, Object> response = new HashMap<>();
        response.put("isbn", normalizedIsbn);
        response.put("mightExist", mightExist);
        response.put("definitelyExists", definitelyExists);
        response.put("actuallyExists", actuallyExists); // Database verification result

        // Determine message based on results
        String message;
        if (actuallyExists || definitelyExists) {
            message = "ISBN already exists";
        } else if (isFalsePositive) {
            message = "ISBN does not exist (Bloom filter false positive detected)";
        } else if (mightExist) {
            message = "ISBN might exist (checking database recommended)";
        } else {
            message = "ISBN does not exist";
        }

        response.put("message", message);
        response.put("isFalsePositive", isFalsePositive);

        return ResponseEntity.ok(response);
    }
}
