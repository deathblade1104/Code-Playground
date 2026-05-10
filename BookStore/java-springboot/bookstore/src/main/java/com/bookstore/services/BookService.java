package com.bookstore.services;

import com.bookstore.domain.book.Author;
import com.bookstore.domain.book.Book;
import com.bookstore.dto.CreateBookRequest;
import com.bookstore.repository.AuthorRepository;
import com.bookstore.repository.BookRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final ObjectMapper objectMapper;
    private final BloomFilterService bloomFilterService;
    private final KafkaTemplate<String, String> kafkaTemplate;

    private static final String BOOK_CREATED_TOPIC = "BOOK_CREATED";

    public Page<Book> getAllBooks(Pageable pageable, boolean includeOutOfStock) {
        if (includeOutOfStock) {
            // For admins: show all books sorted by stock (lowest first)
            return bookRepository.findAllOrderedByStockAsc(pageable);
        } else {
            // For customers: show only available books, sorted by stock (lowest first)
            return bookRepository.findAllAvailable(pageable);
        }
    }

    @Cacheable(value = "book", key = "#id")
    public Book getBookById(Long id) {
        return bookRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Book not found"));
    }

    @Transactional
    public Book createBook(CreateBookRequest request) {
        // Normalize ISBN (remove hyphens/spaces)
        String normalizedIsbn = request.getIsbn().replaceAll("[^0-9]", "");

        // Check if ISBN already exists using Bloom filter and then database
        if (bloomFilterService.mightContain(normalizedIsbn)) {
            if (bookRepository.findByIsbn(normalizedIsbn).isPresent()) {
                throw new IllegalArgumentException("Book with ISBN " + normalizedIsbn + " already exists");
            }
        }

        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new IllegalArgumentException("Author not found"));

        Book book = Book.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .genre(request.getGenre())
                .author(author)
                .isbn(normalizedIsbn)
                .s3Path(request.getS3Path())
                .build();

        Book saved = bookRepository.save(book);

        // ISBN will be added to BloomFilter by Kafka consumer after indexing
        // No need to add here - avoids duplicate operations

        // Publish directly to Kafka (non-blocking)
        try {
            String payload = objectMapper.writeValueAsString(saved);
            kafkaTemplate.send(BOOK_CREATED_TOPIC, String.valueOf(saved.getId()), payload)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Successfully published book {} to Kafka", saved.getId());
                    } else {
                        log.error("Failed to publish book {} to Kafka (non-blocking)", saved.getId(), ex);
                    }
                });
            log.info("Created book with ISBN: {} and queued Kafka event", normalizedIsbn);
        } catch (Exception e) {
            log.error("Failed to serialize book for Kafka (non-blocking)", e);
            // Don't throw - allow book creation to succeed even if Kafka fails
        }

        return saved;
    }

    @Transactional
    @CacheEvict(value = "book", key = "#bookId")
    public Book updateStock(Long bookId, int delta) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        int newStock = book.getStock() + delta;
        if (newStock < 0) throw new IllegalStateException("Insufficient stock");

        book.setStock(newStock);
        return bookRepository.save(book);
    }
}
