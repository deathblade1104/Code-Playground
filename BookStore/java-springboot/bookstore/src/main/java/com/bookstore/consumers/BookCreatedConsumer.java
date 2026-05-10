package com.bookstore.consumers;

import com.bookstore.domain.book.Book;
import com.bookstore.repository.BookRepository;
import com.bookstore.services.BloomFilterService;
import com.bookstore.services.OpenSearchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Kafka Consumer for BOOK_CREATED events
 * Consumes events from Kafka and indexes books in OpenSearch
 * Also adds ISBN to BloomFilter for fast existence checks
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookCreatedConsumer {

    private final ObjectMapper objectMapper;
    private final BookRepository bookRepository;
    private final OpenSearchService openSearchService;
    private final BloomFilterService bloomFilterService;

    @KafkaListener(topics = "BOOK_CREATED", groupId = "${spring.kafka.consumer.group-id:bookstore-consumer-group}")
    public void consumeBookCreated(String message, Acknowledgment acknowledgment) {
        try {
            // Parse the book JSON from Kafka message to get ID
            Book book = objectMapper.readValue(message, Book.class);
            Long bookId = book.getId();

            // Fetch full book with author from database (ensures author is loaded)
            Book fullBook = bookRepository.findById(bookId)
                    .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

            // Ensure author is loaded (trigger lazy loading if needed)
            if (fullBook.getAuthor() != null) {
                fullBook.getAuthor().getName(); // Trigger lazy loading
            }

            // Index in OpenSearch
            openSearchService.indexBook(fullBook);

            // Add ISBN to BloomFilter for fast existence checks
            if (fullBook.getIsbn() != null && !fullBook.getIsbn().trim().isEmpty()) {
                String normalizedIsbn = fullBook.getIsbn().replaceAll("[^0-9]", "");
                bloomFilterService.add(normalizedIsbn);
                log.debug("Added ISBN {} to BloomFilter", normalizedIsbn);
            }

            log.info("Successfully indexed book ID: {} to OpenSearch and added ISBN to BloomFilter", fullBook.getId());

            // Acknowledge message processing
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }
        } catch (IOException e) {
            log.error("Failed to parse book from Kafka message: {}", message, e);
            // Don't acknowledge - let Kafka retry
        } catch (Exception e) {
            log.error("Failed to index book to OpenSearch or add to BloomFilter", e);
            // Don't acknowledge - let Kafka retry
        }
    }
}

