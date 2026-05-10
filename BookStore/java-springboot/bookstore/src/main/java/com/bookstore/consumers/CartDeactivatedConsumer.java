package com.bookstore.consumers;

import com.bookstore.services.CartService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * Kafka Consumer for CART_DEACTIVATED events
 * Deactivates cart and creates new empty active cart asynchronously after checkout
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CartDeactivatedConsumer {

    private final CartService cartService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "CART_DEACTIVATED", groupId = "${spring.kafka.consumer.group-id:bookstore-consumer-group}")
    public void consumeCartDeactivated(String message, Acknowledgment acknowledgment) {
        try {
            // Parse the event payload
            Map<String, Object> payload = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
            Long userId = Long.valueOf(payload.get("userId").toString());
            Long cartId = Long.valueOf(payload.get("cartId").toString());
            String orderNumber = payload.get("orderNumber").toString();

            // Deactivate cart and create new active cart
            cartService.deactivateCart(userId);

            log.info("Successfully deactivated cart {} and created new active cart for user {} after order {}",
                    cartId, userId, orderNumber);

            // Acknowledge message processing
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }
        } catch (IOException e) {
            log.error("Failed to parse cart deactivation event: {}", message, e);
            // Don't acknowledge - let Kafka retry
        } catch (Exception e) {
            log.error("Failed to deactivate cart", e);
            // Don't acknowledge - let Kafka retry
        }
    }
}

