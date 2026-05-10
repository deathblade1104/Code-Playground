package com.bookstore.repository;

import com.bookstore.domain.cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    @Query("SELECT DISTINCT c FROM Cart c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.book WHERE c.userId = :userId AND c.isActive = true")
    Optional<Cart> findByUserIdAndIsActiveTrue(@Param("userId") Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT DISTINCT c FROM Cart c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.book WHERE c.userId = :userId AND c.isActive = true")
    Optional<Cart> findByUserIdAndIsActiveTrueWithLock(@Param("userId") Long userId);

    @Query("SELECT DISTINCT c FROM Cart c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.book WHERE c.userId = :userId AND c.isActive = true")
    Optional<Cart> findActiveCartByUserId(@Param("userId") Long userId);
}

