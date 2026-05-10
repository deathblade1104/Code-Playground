package com.bookstore.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;

/**
 * Kafka Configuration
 * Spring Boot auto-configures KafkaTemplate and consumer factories based on application.properties
 * This config adds topic creation for BOOK_CREATED and CART_DEACTIVATED events
 */
@EnableKafka
@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic bookCreatedTopic() {
        return new NewTopic("BOOK_CREATED", 1, (short) 1);
    }

    @Bean
    public NewTopic cartDeactivatedTopic() {
        return new NewTopic("CART_DEACTIVATED", 1, (short) 1);
    }
}
