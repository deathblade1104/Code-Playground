package com.bookstore.services;

import com.bookstore.domain.user.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret:supersecretjwtkeyforbookstoreapplication2024}")
    private String secret;

    @Value("${jwt.expiration:60m}")
    private String expiration;

    /**
     * Get signing key for JWT
     * Ensures the key is at least 256 bits (32 bytes) as required by HMAC-SHA256
     * If secret is shorter, it's hashed to 256 bits using SHA-256
     */
    private SecretKey getSigningKey() {
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);

        // HMAC-SHA256 requires at least 256 bits (32 bytes)
        if (secretBytes.length < 32) {
            log.warn("JWT secret is too short ({} bytes). Hashing to 256 bits for security.", secretBytes.length);
            // Hash the secret to exactly 256 bits (32 bytes) using SHA-256
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                secretBytes = digest.digest(secretBytes);
            } catch (NoSuchAlgorithmException e) {
                throw new RuntimeException("SHA-256 algorithm not available", e);
            }
        } else if (secretBytes.length > 32) {
            // If secret is longer than 32 bytes, truncate or hash it
            // Using first 32 bytes is acceptable for HMAC
            byte[] truncated = new byte[32];
            System.arraycopy(secretBytes, 0, truncated, 0, 32);
            secretBytes = truncated;
        }

        return Keys.hmacShaKeyFor(secretBytes);
    }

    public String generateToken(Long userId, Role role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("user_id", userId);
        claims.put("role", role.name());
        return createToken(claims);
    }

    private String createToken(Map<String, Object> claims) {
        Duration expirationDuration = parseExpiration(expiration);
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationDuration.toMillis());

        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    private Duration parseExpiration(String expiration) {
        if (expiration.endsWith("m")) {
            long minutes = Long.parseLong(expiration.substring(0, expiration.length() - 1));
            return Duration.of(minutes, ChronoUnit.MINUTES);
        } else if (expiration.endsWith("h")) {
            long hours = Long.parseLong(expiration.substring(0, expiration.length() - 1));
            return Duration.of(hours, ChronoUnit.HOURS);
        } else if (expiration.endsWith("d")) {
            long days = Long.parseLong(expiration.substring(0, expiration.length() - 1));
            return Duration.of(days, ChronoUnit.DAYS);
        }
        // Default to 60 minutes
        return Duration.of(60, ChronoUnit.MINUTES);
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("user_id", Long.class));
    }

    public Role extractRole(String token) {
        String roleStr = extractClaim(token, claims -> claims.get("role", String.class));
        return Role.valueOf(roleStr);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public Boolean validateToken(String token) {
        try {
            // First validate signature and parse the token
            extractAllClaims(token);
            // Then check if expired
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public void invalidateToken(String token) {
        // In a stateless JWT system, invalidation is typically handled client-side
        // For a more robust solution, you could implement token blacklisting using Redis
        log.debug("Token invalidated: {}", token);
    }
}

