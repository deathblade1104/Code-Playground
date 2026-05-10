package com.bookstore.repository;

import com.bookstore.domain.book.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {

    /**
     * Find author by exact name (case-insensitive)
     */
    java.util.Optional<Author> findByNameIgnoreCase(String name);

    /**
     * Find authors by name (case-insensitive, partial match)
     */
    List<Author> findByNameContainingIgnoreCase(String name);

    /**
     * Fuzzy search authors by name using PostgreSQL ILIKE with pattern matching
     * Supports partial matches and case-insensitive search
     */
    @Query("SELECT a FROM Author a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Author> searchByName(@Param("name") String name);

    /**
     * Fuzzy search with similarity - finds authors with names similar to the search term
     * Uses PostgreSQL similarity function (requires pg_trgm extension)
     * Returns authors ordered by similarity score
     */
    @Query(value = "SELECT * FROM bookstore.authors WHERE similarity(LOWER(name), LOWER(:name)) > 0.3 ORDER BY similarity(LOWER(name), LOWER(:name)) DESC", nativeQuery = true)
    List<Author> fuzzySearchByName(@Param("name") String name);
}
