package com.bookstore.domain.book;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.bookstore.constants.TableNames;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = TableNames.BOOKS, indexes = @Index(name = "idx_isbn", columnList = "isbn", unique = true))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Book {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false)
  private BigDecimal price;

  @Column(nullable = false)
  private Integer stock;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", nullable = false)
  private Author author;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Genre genre;

  @Column(updatable = false, name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "s3_path", nullable = false)
  private String s3Path;

  @Column(name = "isbn", nullable = false, unique = true)
  private String isbn;

  @Version
  private Integer version; // For optimistic locking to handle race conditions

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
      createdAt = LocalDateTime.now();
      updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  public void preUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
