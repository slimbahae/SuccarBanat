// src/main/java/com/slimbahael/beauty_center/controller/FileController.java
package com.slimbahael.beauty_center.controller;

import com.slimbahael.beauty_center.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/files")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileUploadService fileUploadService;

    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    // Security: Pattern to validate file paths
    private static final Pattern SAFE_PATH_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]+$");

    @PostMapping("/upload/product-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @RequestParam("file") MultipartFile file) {

        try {
            if (file == null || file.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            String imageUrl = fileUploadService.uploadProductImage(file);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("message", "Product image uploaded successfully");
            response.put("filename", extractFilename(imageUrl));

            log.info("Product image uploaded successfully: {}", imageUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to upload product image", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/upload/profile-image")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            @RequestParam("file") MultipartFile file) {

        try {
            if (file == null || file.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            String imageUrl = fileUploadService.uploadProfileImage(file);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("message", "Profile image uploaded successfully");
            response.put("filename", extractFilename(imageUrl));

            log.info("Profile image uploaded successfully: {}", imageUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to upload profile image", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/upload/service-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadServiceImage(
            @RequestParam("file") MultipartFile file) {

        try {
            if (file == null || file.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            String imageUrl = fileUploadService.uploadServiceImage(file);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("message", "Service image uploaded successfully");
            response.put("filename", extractFilename(imageUrl));

            log.info("Service image uploaded successfully: {}", imageUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to upload service image", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/products/{filename:.+}")
    public ResponseEntity<Resource> getProductImage(@PathVariable String filename) {
        return serveFile("products", filename);
    }

    @GetMapping("/profiles/{filename:.+}")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String filename) {
        return serveFile("profiles", filename);
    }

    @GetMapping("/services/{filename:.+}")
    public ResponseEntity<Resource> getServiceImage(@PathVariable String filename) {
        return serveFile("services", filename);
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteImage(@RequestParam String imageUrl) {
        try {
            if (imageUrl == null || imageUrl.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Image URL is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            fileUploadService.deleteImage(imageUrl);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Image deleted successfully");

            log.info("Image deleted successfully: {}", imageUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to delete image: {}", imageUrl, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getUploadSystemHealth() {
        Map<String, Object> health = new HashMap<>();

        try {
            Path uploadPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
            boolean directoryExists = Files.exists(uploadPath);
            boolean directoryWritable = Files.isWritable(uploadPath);

            health.put("status", directoryExists && directoryWritable ? "UP" : "DOWN");
            health.put("uploadDirectory", uploadPath.toString());
            health.put("directoryExists", directoryExists);
            health.put("directoryWritable", directoryWritable);

            // Check subdirectories
            Map<String, Boolean> subdirectories = new HashMap<>();
            subdirectories.put("products", Files.exists(uploadPath.resolve("products")));
            subdirectories.put("profiles", Files.exists(uploadPath.resolve("profiles")));
            subdirectories.put("services", Files.exists(uploadPath.resolve("services")));
            health.put("subdirectories", subdirectories);

            // Add security info
            health.put("maxFileSize", "10MB");
            health.put("allowedTypes", "JPEG, PNG, GIF, WebP");

            return ResponseEntity.ok(health);

        } catch (Exception e) {
            log.error("Health check failed", e);
            health.put("status", "DOWN");
            health.put("error", "System unavailable");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(health);
        }
    }

    private ResponseEntity<Resource> serveFile(String folder, String filename) {
        try {
            // Security: Validate filename
            if (!isValidFilename(filename)) {
                log.warn("Invalid filename requested: {}", filename);
                return ResponseEntity.badRequest().build();
            }

            // Security: Validate folder
            if (!isValidFolder(folder)) {
                log.warn("Invalid folder requested: {}", folder);
                return ResponseEntity.badRequest().build();
            }

            // Security: Create and validate path
            Path uploadBasePath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
            Path filePath = uploadBasePath.resolve(folder).resolve(filename).normalize();

            // Security: Ensure file is within allowed directory
            if (!filePath.startsWith(uploadBasePath)) {
                log.warn("Path traversal attempt detected: {}", filePath);
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                // Security: Only allow image content types
                if (!isAllowedContentType(contentType)) {
                    log.warn("Disallowed content type requested: {}", contentType);
                    return ResponseEntity.badRequest().build();
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400") // Cache for 1 day
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .header("X-Content-Type-Options", "nosniff") // Security header
                        .body(resource);
            } else {
                log.debug("File not found or not readable: {}/{}", folder, filename);
                return ResponseEntity.notFound().build();
            }

        } catch (MalformedURLException e) {
            log.error("Malformed URL for file: {}/{}", folder, filename, e);
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            log.error("IO error while serving file: {}/{}", folder, filename, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Unexpected error while serving file: {}/{}", folder, filename, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean isValidFilename(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return false;
        }

        // Check for path traversal attempts
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return false;
        }

        // Check for null bytes
        if (filename.contains("\0")) {
            return false;
        }

        // Check length
        if (filename.length() > 255) {
            return false;
        }

        // Check pattern (only safe characters)
        return SAFE_PATH_PATTERN.matcher(filename).matches();
    }

    private boolean isValidFolder(String folder) {
        return "products".equals(folder) || "profiles".equals(folder) || "services".equals(folder);
    }

    private boolean isAllowedContentType(String contentType) {
        if (contentType == null) {
            return false;
        }

        String lowerContentType = contentType.toLowerCase();
        return lowerContentType.startsWith("image/") &&
                (lowerContentType.contains("jpeg") ||
                        lowerContentType.contains("jpg") ||
                        lowerContentType.contains("png") ||
                        lowerContentType.contains("gif") ||
                        lowerContentType.contains("webp"));
    }

    private String extractFilename(String url) {
        if (url == null) return null;
        int lastSlash = url.lastIndexOf('/');
        return lastSlash >= 0 ? url.substring(lastSlash + 1) : url;
    }
}