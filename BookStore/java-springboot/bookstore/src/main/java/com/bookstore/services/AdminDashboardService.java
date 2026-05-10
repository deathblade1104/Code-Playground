package com.bookstore.services;

import com.bookstore.domain.order.Order;
import com.bookstore.domain.order.OrderStatus;
import com.bookstore.dto.AdminDashboardResponse;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardService {

    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse.DashboardStats stats = buildStats();
        List<AdminDashboardResponse.LowStockBook> lowStockBooks = getLowStockBooks(10);
        List<AdminDashboardResponse.RecentOrder> recentOrders = getRecentOrders(10);
        List<AdminDashboardResponse.StockHistory> stockHistory = getStockHistory(20);

        return AdminDashboardResponse.builder()
                .stats(stats)
                .lowStockBooks(lowStockBooks)
                .recentOrders(recentOrders)
                .stockHistory(stockHistory)
                .build();
    }

    private AdminDashboardResponse.DashboardStats buildStats() {
        long totalBooks = bookRepository.count();
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();

        // Count out of stock books efficiently
        long outOfStockBooks = bookRepository.findAll().stream()
                .filter(book -> book.getStock() == 0)
                .count();

        // Calculate revenue from delivered/confirmed orders
        List<Order> allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CONFIRMED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrders = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.PENDING)
                .count();

        long completedOrders = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .count();

        long cancelledOrders = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.CANCELLED)
                .count();

        return AdminDashboardResponse.DashboardStats.builder()
                .totalBooks(totalBooks)
                .totalOrders(totalOrders)
                .totalUsers(totalUsers)
                .outOfStockBooks(outOfStockBooks)
                .totalRevenue(totalRevenue)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .build();
    }

    private List<AdminDashboardResponse.LowStockBook> getLowStockBooks(int threshold) {
        return bookRepository.findAll().stream()
                .filter(book -> book.getStock() > 0 && book.getStock() <= threshold)
                .sorted((a, b) -> Integer.compare(a.getStock(), b.getStock()))
                .limit(10)
                .map(book -> AdminDashboardResponse.LowStockBook.builder()
                        .bookId(book.getId())
                        .title(book.getTitle())
                        .currentStock(book.getStock())
                        .threshold(threshold)
                        .lastRestockDate(book.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private List<AdminDashboardResponse.RecentOrder> getRecentOrders(int limit) {
        // Use pagination to get recent orders efficiently
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Order> orders = orderRepository.findAll(pageable).getContent();

        return orders.stream()
                .map(order -> AdminDashboardResponse.RecentOrder.builder()
                        .orderNumber(order.getOrderNumber())
                        .userId(order.getUser().getId())
                        .userEmail(order.getUser().getEmail())
                        .totalAmount(order.getTotalAmount())
                        .status(order.getStatus().name())
                        .createdAt(order.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private List<AdminDashboardResponse.StockHistory> getStockHistory(int limit) {
        // Get books that were recently updated (last restock)
        // This is a simplified version - in production, you'd track stock changes separately
        return bookRepository.findAll().stream()
                .filter(book -> book.getUpdatedAt() != null)
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .limit(limit)
                .map(book -> AdminDashboardResponse.StockHistory.builder()
                        .bookId(book.getId())
                        .bookTitle(book.getTitle())
                        .newStock(book.getStock())
                        .updatedAt(book.getUpdatedAt())
                        // Note: previousStock and delta would require a separate audit table
                        // For now, we'll just show current stock and update time
                        .previousStock(null)
                        .delta(null)
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminDashboardResponse.LowStockBook> getLowStockBooks(int threshold, int limit) {
        return bookRepository.findAll().stream()
                .filter(book -> book.getStock() > 0 && book.getStock() <= threshold)
                .sorted((a, b) -> Integer.compare(a.getStock(), b.getStock()))
                .limit(limit)
                .map(book -> AdminDashboardResponse.LowStockBook.builder()
                        .bookId(book.getId())
                        .title(book.getTitle())
                        .currentStock(book.getStock())
                        .threshold(threshold)
                        .lastRestockDate(book.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}

