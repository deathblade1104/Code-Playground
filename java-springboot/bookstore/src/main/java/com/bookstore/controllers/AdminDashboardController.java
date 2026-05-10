package com.bookstore.controllers;

import com.bookstore.annotations.RequireAdmin;
import com.bookstore.dto.AdminDashboardResponse;
import com.bookstore.services.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequireAdmin
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminDashboardService.getDashboard());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<AdminDashboardResponse.LowStockBook>> getLowStockBooks(
            @RequestParam(defaultValue = "10") int threshold,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(adminDashboardService.getLowStockBooks(threshold, limit));
    }
}

