// src/main/java/com/slimbahael/beauty_center/service/FileUploadService.java
package com.slimbahael.beauty_center.service;

import com.slimbahael.beauty_center.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Slf4j
public class FileUploadService {

    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    @Value("${file.upload.base-url:http://localhost:8083/api/files}")
    private String baseUrl;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp"
    );

    // Magic bytes for image validation
    private static final byte[] JPEG_MAGIC = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_MAGIC = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
    private static final byte[] GIF_MAGIC = {0x47, 0x49, 0x46};
    private static final byte[] WEBP_MAGIC = {0x52, 0x49, 0x46, 0x46};

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Pattern SAFE_FILENAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]+$");

    public String uploadProductImage(MultipartFile file) {
        validateImageFile(file);
        return uploadImage(file, "products", "product_", 800, 600);
    }

    public String uploadProfileImage(MultipartFile file) {
        validateImageFile(file);
        return uploadImage(file, "profiles", "profile_", 400, 400);
    }

    public String uploadServiceImage(MultipartFile file) {
        validateImageFile(file);
        return uploadImage(file, "services", "service_", 600, 400);
    }

    private String uploadImage(MultipartFile file, String folder, String prefix, int maxWidth, int maxHeight) {
        try {
            createUploadDirectoryIfNotExists();

            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = prefix + generateSecureFilename() + "." + fileExtension;

            // Create secure file path
            Path uploadPath = createSecurePath(folder);
            Path filePath = uploadPath.resolve(uniqueFilename);

            // Validate final path is within allowed directory
            validateSecurePath(filePath);

            // Resize and optimize image before saving
            BufferedImage optimizedImage = resizeAndOptimizeImage(file, maxWidth, maxHeight);

            // Save the optimized image
            ImageIO.write(optimizedImage, getImageFormat(fileExtension), filePath.toFile());

            // Set secure file permissions
            setSecureFilePermissions(filePath);

            String fileUrl = baseUrl + "/" + folder + "/" + uniqueFilename;
            log.info("Successfully uploaded image: {} (size: {} bytes)", fileUrl, file.getSize());
            return fileUrl;

        } catch (IOException e) {
            log.error("Failed to upload image", e);
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            if (imageUrl != null && imageUrl.startsWith(baseUrl)) {
                String relativePath = imageUrl.substring(baseUrl.length());

                // Validate path doesn't contain traversal attempts
                if (relativePath.contains("..") || relativePath.contains("//")) {
                    log.warn("Attempted path traversal in delete operation: {}", relativePath);
                    throw new BadRequestException("Invalid file path");
                }

                Path filePath = Paths.get(uploadDirectory + relativePath).normalize();
                Path uploadBasePath = Paths.get(uploadDirectory).toAbsolutePath().normalize();

                // Ensure file is within upload directory
                if (!filePath.startsWith(uploadBasePath)) {
                    log.warn("Attempted to delete file outside upload directory: {}", filePath);
                    throw new BadRequestException("Invalid file path");
                }

                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    log.info("Successfully deleted image: {}", imageUrl);
                } else {
                    log.warn("Attempted to delete non-existent file: {}", imageUrl);
                }
            }
        } catch (IOException e) {
            log.error("Failed to delete image: {}", imageUrl, e);
            throw new BadRequestException("Failed to delete image: " + e.getMessage());
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size too large. Maximum allowed size is 10MB");
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BadRequestException("Invalid filename");
        }

        // Validate filename security
        validateFilename(originalFilename);

        // Validate file extension
        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Invalid file extension. Allowed: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // Validate file content (magic bytes)
        validateFileContent(file);

        // Validate actual image content
        validateImageContent(file);
    }

    private void validateFilename(String filename) {
        // Check for path traversal attempts
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new BadRequestException("Invalid filename: path traversal detected");
        }

        // Check for null bytes (security issue in some systems)
        if (filename.contains("\0")) {
            throw new BadRequestException("Invalid filename: null byte detected");
        }

        // Check filename length
        if (filename.length() > 255) {
            throw new BadRequestException("Filename too long");
        }

        // Validate filename pattern (only safe characters)
        String nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));
        if (!SAFE_FILENAME_PATTERN.matcher(nameWithoutExtension).matches()) {
            throw new BadRequestException("Invalid filename: contains unsafe characters");
        }
    }

    private void validateFileContent(MultipartFile file) {
        try {
            byte[] fileHeader = new byte[8];
            file.getInputStream().read(fileHeader);

            boolean validMagicBytes = false;

            // Check JPEG
            if (fileHeader.length >= 3 && Arrays.equals(Arrays.copyOf(fileHeader, 3), JPEG_MAGIC)) {
                validMagicBytes = true;
            }
            // Check PNG
            else if (fileHeader.length >= 8 && Arrays.equals(Arrays.copyOf(fileHeader, 8), PNG_MAGIC)) {
                validMagicBytes = true;
            }
            // Check GIF
            else if (fileHeader.length >= 3 && Arrays.equals(Arrays.copyOf(fileHeader, 3), GIF_MAGIC)) {
                validMagicBytes = true;
            }
            // Check WebP (simplified check)
            else if (fileHeader.length >= 4 && Arrays.equals(Arrays.copyOf(fileHeader, 4), WEBP_MAGIC)) {
                validMagicBytes = true;
            }

            if (!validMagicBytes) {
                throw new BadRequestException("File content does not match declared image type");
            }

        } catch (IOException e) {
            throw new BadRequestException("Error validating file content: " + e.getMessage());
        }
    }

    private void validateImageContent(MultipartFile file) {
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new BadRequestException("File is not a valid image or format is not supported");
            }

            // Additional image validation
            int width = image.getWidth();
            int height = image.getHeight();

            if (width <= 0 || height <= 0) {
                throw new BadRequestException("Invalid image dimensions");
            }

            if (width > 5000 || height > 5000) {
                throw new BadRequestException("Image dimensions too large (max 5000x5000)");
            }

        } catch (IOException e) {
            throw new BadRequestException("Invalid image file: " + e.getMessage());
        }
    }

    private BufferedImage resizeAndOptimizeImage(MultipartFile file, int maxWidth, int maxHeight) throws IOException {
        BufferedImage originalImage = ImageIO.read(file.getInputStream());

        if (originalImage == null) {
            throw new BadRequestException("Invalid image file");
        }

        // Calculate new dimensions while maintaining aspect ratio
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();

        // If image is smaller than max dimensions, don't resize
        if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
            return optimizeImage(originalImage);
        }

        double widthRatio = (double) maxWidth / originalWidth;
        double heightRatio = (double) maxHeight / originalHeight;
        double ratio = Math.min(widthRatio, heightRatio);

        int newWidth = (int) (originalWidth * ratio);
        int newHeight = (int) (originalHeight * ratio);

        // Create resized image with proper color model
        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resizedImage.createGraphics();

        // Set rendering hints for better quality
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_COLOR_RENDERING, RenderingHints.VALUE_COLOR_RENDER_QUALITY);

        // Fill background with white (for transparency)
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, newWidth, newHeight);

        g2d.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        g2d.dispose();

        return resizedImage;
    }

    private BufferedImage optimizeImage(BufferedImage image) {
        // Convert to RGB if needed (removes transparency)
        if (image.getType() != BufferedImage.TYPE_INT_RGB) {
            BufferedImage rgbImage = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = rgbImage.createGraphics();
            g2d.setColor(Color.WHITE);
            g2d.fillRect(0, 0, image.getWidth(), image.getHeight());
            g2d.drawImage(image, 0, 0, null);
            g2d.dispose();
            return rgbImage;
        }
        return image;
    }

    private void createUploadDirectoryIfNotExists() throws IOException {
        Path uploadPath = Paths.get(uploadDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            setSecureDirectoryPermissions(uploadPath);
        }
    }

    private Path createSecurePath(String folder) throws IOException {
        Path uploadPath = Paths.get(uploadDirectory, folder).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        setSecureDirectoryPermissions(uploadPath);
        return uploadPath;
    }

    private void validateSecurePath(Path filePath) {
        Path uploadBasePath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        if (!filePath.normalize().startsWith(uploadBasePath)) {
            throw new BadRequestException("Invalid file path: outside upload directory");
        }
    }

    private void setSecureFilePermissions(Path filePath) {
        try {
            // Set file permissions: owner read/write, group read, others none
            Files.setPosixFilePermissions(filePath,
                    java.nio.file.attribute.PosixFilePermissions.fromString("rw-r-----"));
        } catch (Exception e) {
            // Ignore on Windows or if not supported
            log.debug("Could not set POSIX file permissions: {}", e.getMessage());
        }
    }

    private void setSecureDirectoryPermissions(Path dirPath) {
        try {
            // Set directory permissions: owner read/write/execute, group read/execute, others none
            Files.setPosixFilePermissions(dirPath,
                    java.nio.file.attribute.PosixFilePermissions.fromString("rwxr-x---"));
        } catch (Exception e) {
            // Ignore on Windows or if not supported
            log.debug("Could not set POSIX directory permissions: {}", e.getMessage());
        }
    }

    private String generateSecureFilename() {
        try {
            // Generate secure random filename
            String uuid = UUID.randomUUID().toString().replace("-", "");
            String timestamp = String.valueOf(System.currentTimeMillis());

            // Add hash for additional uniqueness
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest((uuid + timestamp).getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.substring(0, 16); // Use first 16 chars of hash

        } catch (NoSuchAlgorithmException e) {
            // Fallback to UUID if SHA-256 not available
            return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new BadRequestException("File must have an extension");
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private String getImageFormat(String fileExtension) {
        // ImageIO doesn't support webp directly, so convert to jpg
        if ("webp".equals(fileExtension.toLowerCase())) {
            return "jpg";
        }
        return fileExtension.toLowerCase();
    }
}