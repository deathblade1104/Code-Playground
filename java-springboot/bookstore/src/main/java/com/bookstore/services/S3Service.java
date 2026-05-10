package com.bookstore.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import jakarta.annotation.PostConstruct;
import java.net.URL;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket:bookstore-files}")
    private String bucketName;

    @Value("${aws.s3.presigned-url-expiration-minutes:15}")
    private int expirationMinutes;

    @PostConstruct
    public void initializeBucket() {
        try {
            if (!bucketExists()) {
                createBucket();
                log.info("Created S3 bucket: {}", bucketName);
            } else {
                log.debug("S3 bucket already exists: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("Failed to initialize S3 bucket", e);
            throw new RuntimeException("Failed to initialize S3 bucket", e);
        }
    }

    private boolean bucketExists() {
        try {
            HeadBucketRequest request = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            s3Client.headBucket(request);
            return true;
        } catch (NoSuchBucketException e) {
            return false;
        } catch (Exception e) {
            log.error("Error checking if bucket exists", e);
            return false;
        }
    }

    private void createBucket() {
        CreateBucketRequest request = CreateBucketRequest.builder()
                .bucket(bucketName)
                .build();
        s3Client.createBucket(request);
    }

    /**
     * Generates a presigned PUT URL for uploading a file to S3
     * @param fileName The name of the file to upload (e.g., "book-cover.jpg")
     * @return Presigned URL for PUT operation
     */
    public String generatePresignedPutUrl(String fileName) {
        String key = generateS3Key(fileName);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(getContentType(fileName))
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(expirationMinutes))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        URL url = presignedRequest.url();
        log.debug("Generated presigned PUT URL for key: {}", key);
        return url.toString();
    }

    /**
     * Generates a unique S3 key for the file
     * Format: books/{uuid}/{fileName}
     */
    private String generateS3Key(String fileName) {
        String uuid = UUID.randomUUID().toString();
        return String.format("books/%s/%s", uuid, fileName);
    }

    /**
     * Gets content type based on file extension
     */
    private String getContentType(String fileName) {
        String lowerCase = fileName.toLowerCase();
        if (lowerCase.endsWith(".jpg") || lowerCase.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerCase.endsWith(".png")) {
            return "image/png";
        } else if (lowerCase.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowerCase.endsWith(".txt")) {
            return "text/plain";
        }
        return "application/octet-stream";
    }

    /**
     * Gets the S3 path/key for a given file name
     * This can be stored in the database
     */
    public String getS3Path(String fileName) {
        return generateS3Key(fileName);
    }
}

