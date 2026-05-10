package com.bookstore.config;

import com.bookstore.filters.RequireAdminInterceptor;
import org.springframework.lang.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration to register interceptors
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final RequireAdminInterceptor requireAdminInterceptor;

    public WebConfig(RequireAdminInterceptor requireAdminInterceptor) {
        this.requireAdminInterceptor = requireAdminInterceptor;
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(requireAdminInterceptor);
    }
}

