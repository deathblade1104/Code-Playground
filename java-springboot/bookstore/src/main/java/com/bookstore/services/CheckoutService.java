package com.bookstore.services;

import com.bookstore.domain.book.Book;
import com.bookstore.domain.cart.Cart;
import com.bookstore.domain.cart.CartItem;
import com.bookstore.domain.order.Order;
import com.bookstore.domain.order.OrderItem;
import com.bookstore.domain.order.OrderStatus;
import com.bookstore.domain.user.User;
import com.bookstore.dto.OrderResponse;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String CART_DEACTIVATED_TOPIC = "CART_DEACTIVATED";

    /**
     * Checkout cart and create order with race condition handling
     * Uses optimistic locking on books and pessimistic locking on cart
     * Publishes Kafka event to deactivate cart asynchronously
     */
    @Transactional
    public OrderResponse checkout(Long userId) {
        int maxRetries = 5;
        int retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                // Lock active cart for update
                Cart cart = cartRepository.findByUserIdAndIsActiveTrueWithLock(userId)
                        .orElseThrow(() -> new IllegalArgumentException("Cannot checkout: cart is empty or not found. Please add items to your cart first."));

                if (cart.getItems().isEmpty()) {
                    throw new IllegalStateException("Cannot checkout empty cart");
                }

                // Collect all book IDs from cart items
                List<Long> bookIds = cart.getItems().stream()
                        .map(item -> item.getBook().getId())
                        .collect(Collectors.toList());

                // Bulk fetch all books with pessimistic locking (single query)
                List<Book> books = bookRepository.findByIdsWithLock(bookIds);

                // Create a map for quick lookup by book ID
                Map<Long, Book> booksMap = books.stream()
                        .collect(Collectors.toMap(Book::getId, book -> book));

                // Validate stock availability and update stock atomically
                for (CartItem item : cart.getItems()) {
                    Book book = booksMap.get(item.getBook().getId());

                    if (book == null) {
                        throw new IllegalArgumentException("Book not found: " + item.getBook().getId());
                    }

                    // Re-check stock with current version
                    if (book.getStock() < item.getQuantity()) {
                        throw new IllegalStateException(
                                String.format("Insufficient stock for book '%s'. Available: %d, Requested: %d",
                                        book.getTitle(), book.getStock(), item.getQuantity()));
                    }

                    // Update stock atomically (pessimistic locking prevents concurrent modifications)
                    int newStock = book.getStock() - item.getQuantity();
                    book.setStock(newStock);
                }

                // Bulk save all books (single save call - JPA will batch if configured)
                bookRepository.saveAll(books);

                // Generate unique order number
                String orderNumber = generateOrderNumber();

                // Create order
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                Order order = Order.builder()
                        .orderNumber(orderNumber)
                        .user(user)
                        .status(OrderStatus.CONFIRMED)
                        .build();

                // Create order items
                List<OrderItem> orderItems = cart.getItems().stream()
                        .map(cartItem -> {
                            BigDecimal subtotal = cartItem.getBook().getPrice()
                                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

                            return OrderItem.builder()
                                    .order(order)
                                    .book(cartItem.getBook())
                                    .quantity(cartItem.getQuantity())
                                    .unitPrice(cartItem.getBook().getPrice())
                                    .subtotal(subtotal)
                                    .build();
                        })
                        .collect(Collectors.toList());

                order.setItems(orderItems);

                BigDecimal totalAmount = orderItems.stream()
                        .map(OrderItem::getSubtotal)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                order.setTotalAmount(totalAmount);

                // Save order
                Order savedOrder = orderRepository.save(order);

                // Publish Kafka event to deactivate cart asynchronously
                try {
                    Map<String, Object> eventPayload = new HashMap<>();
                    eventPayload.put("userId", userId);
                    eventPayload.put("cartId", cart.getId());
                    eventPayload.put("orderNumber", orderNumber);

                    String payload = objectMapper.writeValueAsString(eventPayload);
                    kafkaTemplate.send(CART_DEACTIVATED_TOPIC, String.valueOf(userId), payload)
                            .whenComplete((result, ex) -> {
                                if (ex == null) {
                                    log.info("Published cart deactivation event for user {}", userId);
                                } else {
                                    log.error("Failed to publish cart deactivation event", ex);
                                }
                            });
                } catch (Exception e) {
                    log.error("Failed to publish cart deactivation event (non-blocking)", e);
                    // Don't throw - checkout succeeds even if Kafka fails
                }

                log.info("Order created successfully: {} for user: {}", orderNumber, userId);

                return buildOrderResponse(savedOrder);

            } catch (OptimisticLockingFailureException e) {
                retryCount++;
                log.warn("Optimistic lock conflict during checkout, retry {}/{}", retryCount, maxRetries);

                if (retryCount >= maxRetries) {
                    throw new IllegalStateException(
                            "Failed to complete checkout due to concurrent modifications. Please try again.", e);
                }

                // Exponential backoff
                try {
                    Thread.sleep(100 * retryCount);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException("Interrupted during checkout retry", ie);
                }
            }
        }

        throw new IllegalStateException("Failed to complete checkout after retries");
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() +
               "-" + System.currentTimeMillis();
    }

    private OrderResponse buildOrderResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .bookId(item.getBook().getId())
                        .bookTitle(item.getBook().getTitle())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(OrderResponse.OrderStatus.valueOf(order.getStatus().name()))
                .totalAmount(order.getTotalAmount())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
