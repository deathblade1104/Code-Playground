package com.bookstore.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

/**
 * Bloom Filter Service for ISBN checking
 * Uses RedisBloom module - thread-safe, true Bloom Filter
 * No in-memory state - all operations go through Redis
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BloomFilterService {

    private static final String BLOOM_FILTER_KEY = "isbn:bloom:filter";
    private static final String ISBN_SET_KEY = "isbn:set";
    private static final int EXPECTED_INSERTIONS = 1_000_000; // Expected number of ISBNs
    private static final double FALSE_POSITIVE_RATE = 0.01; // 1% false positive rate

    private final StringRedisTemplate redisTemplate;

    @PostConstruct
    public void initializeBloomFilter() {
        // Try to create Bloom Filter if it doesn't exist
        // BF.RESERVE will fail if filter already exists, which is fine
        boolean bloomFilterAvailable = false;
        try {
            redisTemplate.execute((RedisCallback<Object>) connection -> {
                connection.execute("BF.RESERVE",
                        BLOOM_FILTER_KEY.getBytes(),
                        String.valueOf(FALSE_POSITIVE_RATE).getBytes(),
                        String.valueOf(EXPECTED_INSERTIONS).getBytes());
                return null;
            });
            bloomFilterAvailable = true;
            log.info("Created Redis Bloom Filter with capacity: {}, false positive rate: {}",
                    EXPECTED_INSERTIONS, FALSE_POSITIVE_RATE);
        } catch (Exception e) {
            // Filter might already exist - check if it's actually available
            if (e.getMessage() != null && e.getMessage().contains("exists")) {
                // Filter exists, check if RedisBloom is actually available
                try {
                    redisTemplate.execute((RedisCallback<Object>) connection -> {
                        byte[] key = BLOOM_FILTER_KEY.getBytes();
                        byte[] value = "test".getBytes();
                        connection.execute("BF.EXISTS", key, value);
                        return null;
                    });
                    bloomFilterAvailable = true;
                    log.info("Redis Bloom Filter already exists and is functional");
                } catch (Exception ex) {
                    log.warn("Redis Bloom Filter module not available. Falling back to Redis Set for ISBN checks. " +
                            "To enable Bloom Filter, install RedisBloom module: https://github.com/RedisBloom/RedisBloom");
                }
            } else {
                log.warn("Failed to create Bloom Filter. RedisBloom module might not be installed. " +
                        "Falling back to Redis Set for ISBN checks. " +
                        "Install RedisBloom: https://github.com/RedisBloom/RedisBloom");
            }
        }

        // Also ensure ISBN set exists (fallback mechanism)
        Long setSize = redisTemplate.opsForSet().size(ISBN_SET_KEY);
        log.info("ISBN set size: {} (Bloom Filter available: {})",
                setSize != null ? setSize : 0, bloomFilterAvailable);
    }

    /**
     * Checks if ISBN might exist (Redis Bloom Filter check)
     * Returns true if ISBN might exist, false if definitely doesn't exist
     * Thread-safe - Redis operations are atomic
     */
    public boolean mightContain(String isbn) {
        if (isbn == null || isbn.trim().isEmpty()) {
            return false;
        }
        String normalizedIsbn = Objects.requireNonNull(isbn.trim());

        try {
            Object result = redisTemplate.execute((RedisCallback<Object>) connection -> {
                byte[] key = BLOOM_FILTER_KEY.getBytes();
                byte[] value = normalizedIsbn.getBytes();
                return connection.execute("BF.EXISTS", key, value);
            });

            // RedisBloom returns 1 for exists, 0 for doesn't exist
            return result instanceof Long && ((Long) result) == 1L;
        } catch (Exception e) {
            log.error("Error checking Bloom Filter for ISBN: {}", normalizedIsbn, e);
            // Fallback to Redis set check if Bloom Filter fails
            return definitelyExists(normalizedIsbn);
        }
    }

    /**
     * Adds ISBN to Redis Bloom Filter and Redis set
     * Thread-safe - Redis operations are atomic
     */
    public void add(String isbn) {
        if (isbn == null || isbn.trim().isEmpty()) {
            return;
        }
        String normalizedIsbn = Objects.requireNonNull(isbn.trim());

        try {
            // Add to Bloom Filter
            redisTemplate.execute((RedisCallback<Object>) connection -> {
                byte[] key = BLOOM_FILTER_KEY.getBytes();
                byte[] value = normalizedIsbn.getBytes();
                connection.execute("BF.ADD", key, value);
                return null;
            });

            // Also add to Redis set for definitive checks
            redisTemplate.opsForSet().add(ISBN_SET_KEY, normalizedIsbn);
            redisTemplate.expire(ISBN_SET_KEY, 365, TimeUnit.DAYS);

            log.debug("Added ISBN to Redis Bloom Filter: {}", normalizedIsbn);
        } catch (Exception e) {
            log.error("Error adding ISBN to Bloom Filter: {}", normalizedIsbn, e);
            // Fallback: at least add to Redis set
            redisTemplate.opsForSet().add(ISBN_SET_KEY, normalizedIsbn);
            redisTemplate.expire(ISBN_SET_KEY, 365, TimeUnit.DAYS);
        }
    }

    /**
     * Verifies if ISBN actually exists in Redis set (definitive check)
     * Thread-safe - Redis operations are atomic
     */
    public boolean definitelyExists(String isbn) {
        if (isbn == null || isbn.trim().isEmpty()) {
            return false;
        }
        return Boolean.TRUE.equals(
            redisTemplate.opsForSet().isMember(ISBN_SET_KEY, Objects.requireNonNull(isbn.trim()))
        );
    }
}

