package com.bookstore.services;

import com.bookstore.domain.book.Book;
import com.bookstore.domain.order.Order;
import com.bookstore.domain.order.OrderStatus;
import com.bookstore.dto.OrderResponse;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;

    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        return buildOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream()
                .map(this::buildOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse cancelOrder(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is already cancelled");
        }

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.SHIPPED) {
            throw new IllegalStateException("Cannot cancel order that is already shipped or delivered");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Collect book IDs and bulk fetch (optimized)
        List<Long> bookIds = order.getItems().stream()
                .map(item -> item.getBook().getId())
                .collect(Collectors.toList());

        // Bulk fetch books with pessimistic locking
        List<Book> books = bookRepository.findByIdsWithLock(bookIds);
        Map<Long, Book> booksMap = books.stream()
                .collect(Collectors.toMap(Book::getId, book -> book));

        // Restore stock
        order.getItems().forEach(item -> {
            Book book = booksMap.get(item.getBook().getId());
            if (book == null) {
                throw new IllegalArgumentException("Book not found: " + item.getBook().getId());
            }
            book.setStock(book.getStock() + item.getQuantity());
        });

        // Bulk save all books
        bookRepository.saveAll(books);

        Order savedOrder = orderRepository.save(order);
        log.info("Order cancelled: {}", orderNumber);

        return buildOrderResponse(savedOrder);
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

