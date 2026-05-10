package com.bookstore.filters;

import com.bookstore.domain.user.Role;
import com.bookstore.services.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT Authentication Filter (NestJS Guard Equivalent)
 * Extracts JWT token from Authorization header and validates it
 * Sets authentication in SecurityContext if token is valid
 *
 * IMPORTANT: This filter must NOT interfere with Spring Security's anonymous authentication
 * for permitAll() endpoints. If no token is provided, we let Spring Security handle it.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Extract JWT token from Authorization header if present
        String token = extractTokenFromRequest(request);

        // Only process token if one is provided
        if (token != null) {
            try {
                if (jwtService.validateToken(token)) {
                    Long userId = jwtService.extractUserId(token);
                    Role role = jwtService.extractRole(token);

                    // Create authentication object
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userId,
                                    null,
                                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()))
                            );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("JWT authentication successful for user ID: {}", userId);
                }
                // If token is invalid or expired, don't set authentication
                // Let Spring Security's AnonymousAuthenticationFilter handle anonymous authentication
            } catch (Exception e) {
                // Token parsing/validation failed - don't set authentication
                // Let Spring Security handle anonymous authentication
                log.debug("Token validation failed: {}", e.getMessage());
            }
        }
        // If no token provided, don't do anything
        // Spring Security's AnonymousAuthenticationFilter will set anonymous authentication
        // This is crucial for permitAll() endpoints to work correctly

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts JWT token from Authorization header
     * Format: "Bearer <token>"
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
