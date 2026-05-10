package com.bookstore.repository;

import com.bookstore.domain.book.Book;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Book b WHERE b.id IN :ids")
    List<Book> findByIdsWithLock(@Param("ids") List<Long> ids);

    Page<Book> findAll(Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.stock > 0")
    Page<Book> findAllAvailable(Pageable pageable);

    @Query("SELECT b FROM Book b ORDER BY b.stock ASC")
    Page<Book> findAllOrderedByStockAsc(Pageable pageable);
}