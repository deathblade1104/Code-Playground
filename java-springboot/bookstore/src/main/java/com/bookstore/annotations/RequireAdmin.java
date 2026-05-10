package com.bookstore.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark endpoints that require ADMIN role
 *
 * Usage:
 * @RequireAdmin
 * @PostMapping("/admin-only")
 * public ResponseEntity<?> adminEndpoint() { ... }
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAdmin {
}

