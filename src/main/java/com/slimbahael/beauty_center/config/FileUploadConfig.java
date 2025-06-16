// src/main/java/com/slimbahael/beauty_center/config/FileUploadConfig.java
package com.slimbahael.beauty_center.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.MultipartConfigElement;
import java.nio.file.Paths;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();

        // Set maximum file size (10MB)
        factory.setMaxFileSize(DataSize.ofMegabytes(10));

        // Set maximum request size (50MB)
        factory.setMaxRequestSize(DataSize.ofMegabytes(50));

        // Set file size threshold
        factory.setFileSizeThreshold(DataSize.ofKilobytes(2));

        return factory.createMultipartConfig();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files statically
        String uploadPath = Paths.get(uploadDirectory).toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath)
                .setCachePeriod(86400); // Cache for 1 day
    }
}