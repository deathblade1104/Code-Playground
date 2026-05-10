package com.bookstore.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Enumeration;

/**
 * Logging filter for HTTP requests and responses
 * Logs method, URI, headers, and body for both request and response
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class RequestResponseLoggingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip logging for actuator endpoints and static resources
        String path = request.getRequestURI();
        if (path.startsWith("/actuator") || path.startsWith("/error")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Wrap request and response to cache bodies
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        // Log request
        logRequest(wrappedRequest);

        long startTime = System.currentTimeMillis();

        try {
            // Proceed with the filter chain
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            // Log response
            long duration = System.currentTimeMillis() - startTime;
            logResponse(wrappedRequest, wrappedResponse, duration);

            // Copy response body back to original response
            wrappedResponse.copyBodyToResponse();
        }
    }

    private void logRequest(ContentCachingRequestWrapper request) {
        StringBuilder logMessage = new StringBuilder("\n");
        logMessage.append("═══════════════════════════════════════════════════════════════\n");
        logMessage.append("📥 INCOMING REQUEST\n");
        logMessage.append("═══════════════════════════════════════════════════════════════\n");
        logMessage.append(String.format("Method: %s\n", request.getMethod()));
        logMessage.append(String.format("URI: %s\n", request.getRequestURI()));

        String queryString = request.getQueryString();
        if (queryString != null && !queryString.isEmpty()) {
            logMessage.append(String.format("Query: %s\n", queryString));
        }

        // Log headers
        logMessage.append("\n📋 Headers:\n");
        Enumeration<String> headerNames = request.getHeaderNames();
        if (headerNames != null) {
            Collections.list(headerNames).forEach(headerName -> {
                String headerValue = request.getHeader(headerName);
                // Mask sensitive headers
                if (isSensitiveHeader(headerName)) {
                    headerValue = maskSensitiveValue(headerValue);
                }
                logMessage.append(String.format("  %s: %s\n", headerName, headerValue));
            });
        }

        // Log request body
        byte[] contentAsByteArray = request.getContentAsByteArray();
        if (contentAsByteArray.length > 0) {
            String body = new String(contentAsByteArray, StandardCharsets.UTF_8);
            logMessage.append("\n📄 Request Body:\n");
            logMessage.append(formatJsonBody(body));
        }

        logMessage.append("═══════════════════════════════════════════════════════════════\n");
        log.info(logMessage.toString());
    }

    private void logResponse(
            ContentCachingRequestWrapper request,
            ContentCachingResponseWrapper response,
            long duration
    ) {
        StringBuilder logMessage = new StringBuilder("\n");
        logMessage.append("═══════════════════════════════════════════════════════════════\n");
        logMessage.append("📤 OUTGOING RESPONSE\n");
        logMessage.append("═══════════════════════════════════════════════════════════════\n");
        logMessage.append(String.format("Method: %s\n", request.getMethod()));
        logMessage.append(String.format("URI: %s\n", request.getRequestURI()));
        logMessage.append(String.format("Status: %d %s\n", response.getStatus(), getStatusText(response.getStatus())));
        logMessage.append(String.format("Duration: %d ms\n", duration));

        // Log response headers
        logMessage.append("\n📋 Headers:\n");
        response.getHeaderNames().forEach(headerName -> {
            String headerValue = response.getHeader(headerName);
            logMessage.append(String.format("  %s: %s\n", headerName, headerValue));
        });

        // Log response body
        byte[] contentAsByteArray = response.getContentAsByteArray();
        if (contentAsByteArray.length > 0) {
            String body = new String(contentAsByteArray, StandardCharsets.UTF_8);
            logMessage.append("\n📄 Response Body:\n");
            logMessage.append(formatJsonBody(body));
        }

        logMessage.append("═══════════════════════════════════════════════════════════════\n");
        log.info(logMessage.toString());
    }

    private boolean isSensitiveHeader(String headerName) {
        String lower = headerName.toLowerCase();
        return lower.contains("authorization") ||
               lower.contains("password") ||
               lower.contains("token") ||
               lower.contains("secret") ||
               lower.contains("cookie");
    }

    private String maskSensitiveValue(String value) {
        if (value == null || value.length() <= 8) {
            return "***";
        }
        return value.substring(0, 4) + "..." + value.substring(value.length() - 4);
    }

    private String formatJsonBody(String body) {
        if (body == null || body.trim().isEmpty()) {
            return "  (empty)\n";
        }

        // Try to format as JSON if it's valid JSON
        try {
            String trimmed = body.trim();
            if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
                // Parse and pretty-print JSON using ObjectMapper
                Object jsonObject = objectMapper.readValue(trimmed, Object.class);
                String prettyJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject);
                // Add indentation to each line
                StringBuilder formatted = new StringBuilder();
                for (String line : prettyJson.split("\n")) {
                    formatted.append("  ").append(line).append("\n");
                }
                return formatted.toString();
            }
        } catch (Exception e) {
            // If JSON parsing fails, return as-is
        }

        // If not JSON, return as-is with indentation
        return "  " + body + "\n";
    }

    private String getStatusText(int status) {
        return switch (status) {
            case 200 -> "OK";
            case 201 -> "Created";
            case 204 -> "No Content";
            case 400 -> "Bad Request";
            case 401 -> "Unauthorized";
            case 403 -> "Forbidden";
            case 404 -> "Not Found";
            case 500 -> "Internal Server Error";
            default -> "Unknown";
        };
    }
}

