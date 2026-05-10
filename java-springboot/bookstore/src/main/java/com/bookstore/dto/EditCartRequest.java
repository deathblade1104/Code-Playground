package com.bookstore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class EditCartRequest {
    @NotEmpty(message = "Items list cannot be empty")
    @Valid
    private List<CartItem> items;

    @Data
    public static class CartItem {
        @NotNull(message = "Book ID is required")
        @Positive(message = "Book ID must be positive")
        private Long bookId;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;
    }
}

