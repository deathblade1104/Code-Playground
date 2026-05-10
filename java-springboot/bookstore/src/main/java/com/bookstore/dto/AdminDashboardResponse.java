package com.bookstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private DashboardStats stats;
    private List<LowStockBook> lowStockBooks;
    private List<RecentOrder> recentOrders;
    private List<StockHistory> stockHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private Long totalBooks;
        private Long totalOrders;
        private Long totalUsers;
        private Long outOfStockBooks;
        private BigDecimal totalRevenue;
        private Long pendingOrders;
        private Long completedOrders;
        private Long cancelledOrders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockBook {
        private Long bookId;
        private String title;
        private Integer currentStock;
        private Integer threshold;
        private LocalDateTime lastRestockDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentOrder {
        private String orderNumber;
        private Long userId;
        private String userEmail;
        private BigDecimal totalAmount;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockHistory {
        private Long bookId;
        private String bookTitle;
        private Integer previousStock;
        private Integer newStock;
        private Integer delta;
        private LocalDateTime updatedAt;
    }
}

