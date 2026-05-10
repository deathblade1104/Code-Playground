package com.bookstore.controllers;

import com.bookstore.dto.CartResponse;
import com.bookstore.dto.EditCartRequest;
import com.bookstore.dto.OrderResponse;
import com.bookstore.services.CartService;
import com.bookstore.services.CheckoutService;
import com.bookstore.services.OrderService;
import com.bookstore.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final CheckoutService checkoutService;
    private final OrderService orderService;

    @GetMapping("/cart")
    public ResponseEntity<CartResponse> getCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/cart/edit")
    public ResponseEntity<CartResponse> editCart(@Valid @RequestBody EditCartRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(cartService.editCart(userId, request));
    }

    @DeleteMapping("/cart/items/{itemId}")
    public ResponseEntity<CartResponse> removeFromCart(@PathVariable Long itemId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(cartService.removeFromCart(userId, itemId));
    }

    @DeleteMapping("/cart")
    public ResponseEntity<Void> clearCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(checkoutService.checkout(userId));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getOrders() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByOrderNumber(orderNumber));
    }
}
