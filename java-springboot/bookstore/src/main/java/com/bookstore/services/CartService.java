package com.bookstore.services;

import com.bookstore.domain.book.Book;
import com.bookstore.domain.cart.Cart;
import com.bookstore.domain.cart.CartItem;
import com.bookstore.dto.CartResponse;
import com.bookstore.dto.EditCartRequest;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final BookRepository bookRepository;

    /**
     * Get or create active cart for user
     * User always has exactly one active cart (even if empty)
     */
    @Transactional
    public Cart getOrCreateActiveCart(Long userId) {
        return cartRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .userId(userId)
                            .isActive(true)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    /**
     * Edit cart - request body is source of truth
     * Completely overwrites cart with items from request
     * Items not in request are removed, items in request are added/updated
     */
    @Transactional
    public CartResponse editCart(Long userId, EditCartRequest request) {
        int maxRetries = 3;
        int retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                // Use pessimistic lock for cart
                Cart cart = cartRepository.findByUserIdAndIsActiveTrueWithLock(userId)
                        .orElseGet(() -> {
                            Cart newCart = Cart.builder()
                                    .userId(userId)
                                    .isActive(true)
                                    .build();
                            return cartRepository.save(newCart);
                        });

                if (!cart.getIsActive()) {
                    throw new IllegalStateException("Cannot edit inactive cart");
                }

                // Collect all book IDs and bulk fetch (optimized)
                List<Long> bookIds = request.getItems().stream()
                        .map(EditCartRequest.CartItem::getBookId)
                        .collect(Collectors.toList());

                // Bulk fetch books with pessimistic locking
                List<Book> books = bookRepository.findByIdsWithLock(bookIds);
                Map<Long, Book> booksMap = books.stream()
                        .collect(Collectors.toMap(Book::getId, book -> book));

                // Validate all books exist and stock is available
                for (EditCartRequest.CartItem itemRequest : request.getItems()) {
                    Book book = booksMap.get(itemRequest.getBookId());

                    if (book == null) {
                        throw new IllegalArgumentException("Book not found: " + itemRequest.getBookId());
                    }

                    // Validate stock availability
                    if (book.getStock() < itemRequest.getQuantity()) {
                        throw new IllegalStateException(
                                String.format("Insufficient stock for book '%s'. Available: %d, Requested: %d",
                                        book.getTitle(), book.getStock(), itemRequest.getQuantity()));
                    }
                }

                // Clear all existing items (request body is source of truth)
                cart.getItems().clear();

                // Add all items from request
                for (EditCartRequest.CartItem itemRequest : request.getItems()) {
                    Book book = booksMap.get(itemRequest.getBookId());

                    CartItem newItem = CartItem.builder()
                            .cart(cart)
                            .book(book)
                            .quantity(itemRequest.getQuantity())
                            .build();
                    cart.getItems().add(newItem);
                }

                cartRepository.save(cart);
                log.info("Cart overwritten for user {} with {} items", userId, request.getItems().size());
                return buildCartResponse(cart);

            } catch (OptimisticLockingFailureException e) {
                retryCount++;
                log.warn("Optimistic lock conflict on cart update, retry {}/{}", retryCount, maxRetries);
                if (retryCount >= maxRetries) {
                    throw new IllegalStateException("Failed to update cart due to concurrent modification", e);
                }
                // Small delay before retry
                try {
                    Thread.sleep(50);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException("Interrupted during retry", ie);
                }
            }
        }

        throw new IllegalStateException("Failed to edit cart after retries");
    }

    /**
     * Get active cart contents
     */
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = cartRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseGet(() -> {
                    // Create empty active cart if none exists
                    Cart newCart = Cart.builder()
                            .userId(userId)
                            .isActive(true)
                            .build();
                    return cartRepository.save(newCart);
                });

        return buildCartResponse(cart);
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public CartResponse removeFromCart(Long userId, Long cartItemId) {
        Cart cart = cartRepository.findByUserIdAndIsActiveTrueWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        cart.getItems().removeIf(item -> item.getId().equals(cartItemId));
        cartRepository.save(cart);

        return buildCartResponse(cart);
    }

    /**
     * Clear cart (remove all items, but keep cart active)
     * Creates empty cart if none exists
     */
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserIdAndIsActiveTrueWithLock(userId)
                .orElseGet(() -> {
                    // Create empty active cart if none exists
                    Cart newCart = Cart.builder()
                            .userId(userId)
                            .isActive(true)
                            .build();
                    return cartRepository.save(newCart);
                });

        cart.getItems().clear();
        cartRepository.save(cart);
    }

    /**
     * Deactivate cart (called asynchronously after checkout)
     */
    @Transactional
    public void deactivateCart(Long userId) {
        Cart cart = cartRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new IllegalArgumentException("Active cart not found for user: " + userId));

        cart.setIsActive(false);
        cartRepository.save(cart);

        // Create new empty active cart for user
        Cart newCart = Cart.builder()
                .userId(userId)
                .isActive(true)
                .build();
        cartRepository.save(newCart);

        log.info("Deactivated cart {} and created new active cart for user {}", cart.getId(), userId);
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartResponse.CartItemResponse> items = cart.getItems().stream()
                .map(item -> {
                    BigDecimal subtotal = item.getBook().getPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    return CartResponse.CartItemResponse.builder()
                            .itemId(item.getId())
                            .bookId(item.getBook().getId())
                            .bookTitle(item.getBook().getTitle())
                            .unitPrice(item.getBook().getPrice())
                            .quantity(item.getQuantity())
                            .subtotal(subtotal)
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal totalAmount = items.stream()
                .map(CartResponse.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
                .mapToInt(CartResponse.CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUserId())
                .isActive(cart.getIsActive())
                .items(items)
                .totalAmount(totalAmount)
                .totalItems(totalItems)
                .build();
    }
}
