// Enhanced ProductService.java with proper discount calculations
package com.slimbahael.beauty_center.service;

import com.slimbahael.beauty_center.dto.ProductRequest;
import com.slimbahael.beauty_center.dto.ProductResponse;
import com.slimbahael.beauty_center.exception.ResourceNotFoundException;
import com.slimbahael.beauty_center.model.Product;
import com.slimbahael.beauty_center.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapProductToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByActiveIsTrue()
                .stream()
                .map(this::mapProductToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByFeaturedIsTrue()
                .stream()
                .map(this::mapProductToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.findByCategory(category)
                .stream()
                .map(this::mapProductToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapProductToResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapProductToResponse(product);
    }

    public ProductResponse createProduct(ProductRequest productRequest) {
        // Validate discount data
        validateDiscountData(productRequest);

        Product product = Product.builder()
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .category(productRequest.getCategory())
                .price(productRequest.getPrice())
                .stockQuantity(productRequest.getStockQuantity())
                .imageUrls(productRequest.getImageUrls())
                .tags(productRequest.getTags())
                .brand(productRequest.getBrand())
                .sku(productRequest.getSku())
                .featured(productRequest.isFeatured())
                .active(productRequest.isActive())
                .createdAt(new Date())
                .updatedAt(new Date())
                .discountPercentage(productRequest.getDiscountPercentage())
                .discountStartDate(productRequest.getDiscountStartDate())
                .discountEndDate(productRequest.getDiscountEndDate())
                .build();

        // Map specifications if they exist
        if (productRequest.getSpecifications() != null && !productRequest.getSpecifications().isEmpty()) {
            List<Product.ProductSpecification> specifications = productRequest.getSpecifications().stream()
                    .map(spec -> Product.ProductSpecification.builder()
                            .name(spec.getName())
                            .value(spec.getValue())
                            .build())
                    .collect(Collectors.toList());
            product.setSpecifications(specifications);
        } else {
            product.setSpecifications(new ArrayList<>());
        }

        Product savedProduct = productRepository.save(product);
        log.info("Created product with ID: {} and discount: {}%", savedProduct.getId(), savedProduct.getDiscountPercentage());

        return mapProductToResponse(savedProduct);
    }

    public ProductResponse updateProduct(String id, ProductRequest productRequest) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Validate discount data
        validateDiscountData(productRequest);

        existingProduct.setName(productRequest.getName());
        existingProduct.setDescription(productRequest.getDescription());
        existingProduct.setCategory(productRequest.getCategory());
        existingProduct.setPrice(productRequest.getPrice());
        existingProduct.setStockQuantity(productRequest.getStockQuantity());
        existingProduct.setImageUrls(productRequest.getImageUrls());
        existingProduct.setTags(productRequest.getTags());
        existingProduct.setBrand(productRequest.getBrand());
        existingProduct.setSku(productRequest.getSku());
        existingProduct.setFeatured(productRequest.isFeatured());
        existingProduct.setActive(productRequest.isActive());
        existingProduct.setUpdatedAt(new Date());
        existingProduct.setDiscountPercentage(productRequest.getDiscountPercentage());
        existingProduct.setDiscountStartDate(productRequest.getDiscountStartDate());
        existingProduct.setDiscountEndDate(productRequest.getDiscountEndDate());

        // Map specifications if they exist
        if (productRequest.getSpecifications() != null && !productRequest.getSpecifications().isEmpty()) {
            List<Product.ProductSpecification> specifications = productRequest.getSpecifications().stream()
                    .map(spec -> Product.ProductSpecification.builder()
                            .name(spec.getName())
                            .value(spec.getValue())
                            .build())
                    .collect(Collectors.toList());
            existingProduct.setSpecifications(specifications);
        } else {
            existingProduct.setSpecifications(new ArrayList<>());
        }

        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Updated product with ID: {} and discount: {}%", updatedProduct.getId(), updatedProduct.getDiscountPercentage());

        return mapProductToResponse(updatedProduct);
    }

    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
        log.info("Deleted product with ID: {}", id);
    }

    // Helper method to validate discount data
    private void validateDiscountData(ProductRequest productRequest) {
        BigDecimal discountPercentage = productRequest.getDiscountPercentage();
        Date discountStartDate = productRequest.getDiscountStartDate();
        Date discountEndDate = productRequest.getDiscountEndDate();

        if (discountPercentage != null && discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            // If discount percentage is provided, validate range
            if (discountPercentage.compareTo(BigDecimal.ZERO) < 0 ||
                    discountPercentage.compareTo(new BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("Discount percentage must be between 0 and 100");
            }

            // If discount percentage is provided, dates should also be provided
            if (discountStartDate == null || discountEndDate == null) {
                throw new IllegalArgumentException("Discount start date and end date are required when discount percentage is provided");
            }

            // Validate date range
            if (discountStartDate.after(discountEndDate)) {
                throw new IllegalArgumentException("Discount start date must be before end date");
            }

            // Warn if discount period is in the past
            Date now = new Date();
            if (discountEndDate.before(now)) {
                log.warn("Discount end date is in the past for product: {}", productRequest.getName());
            }
        }
    }

    // Helper method to calculate if discount is currently active
    private boolean isDiscountActive(Product product) {
        if (product.getDiscountPercentage() == null ||
                product.getDiscountPercentage().compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }

        if (product.getDiscountStartDate() == null || product.getDiscountEndDate() == null) {
            return false;
        }

        Date now = new Date();
        return !now.before(product.getDiscountStartDate()) && !now.after(product.getDiscountEndDate());
    }

    // Helper method to calculate final price with discount
    private BigDecimal calculateFinalPrice(Product product) {
        BigDecimal originalPrice = product.getPrice();

        if (!isDiscountActive(product)) {
            return originalPrice;
        }

        BigDecimal discountAmount = originalPrice
                .multiply(product.getDiscountPercentage())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        BigDecimal finalPrice = originalPrice.subtract(discountAmount);

        // Ensure final price is not negative
        return finalPrice.max(BigDecimal.ZERO);
    }

    // Helper method to get discount status
    private String getDiscountStatus(Product product) {
        if (product.getDiscountPercentage() == null ||
                product.getDiscountPercentage().compareTo(BigDecimal.ZERO) <= 0) {
            return "NO_DISCOUNT";
        }

        if (product.getDiscountStartDate() == null || product.getDiscountEndDate() == null) {
            return "INVALID_DATES";
        }

        Date now = new Date();

        if (now.before(product.getDiscountStartDate())) {
            return "SCHEDULED";
        } else if (now.after(product.getDiscountEndDate())) {
            return "EXPIRED";
        } else {
            return "ACTIVE";
        }
    }

    // Helper method to map Product entity to ProductResponse DTO
    private ProductResponse mapProductToResponse(Product product) {
        BigDecimal finalPrice = calculateFinalPrice(product);
        boolean discountActive = isDiscountActive(product);
        String discountStatus = getDiscountStatus(product);

        // Calculate additional discount information
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal savingsPercentage = BigDecimal.ZERO;

        if (discountActive && finalPrice.compareTo(product.getPrice()) < 0) {
            discountAmount = product.getPrice().subtract(finalPrice);
            savingsPercentage = discountAmount
                    .multiply(new BigDecimal("100"))
                    .divide(product.getPrice(), 2, RoundingMode.HALF_UP);
        }

        // Map specifications
        List<ProductResponse.ProductSpecificationDto> specificationDtos = new ArrayList<>();
        if (product.getSpecifications() != null) {
            specificationDtos = product.getSpecifications().stream()
                    .map(spec -> ProductResponse.ProductSpecificationDto.builder()
                            .name(spec.getName())
                            .value(spec.getValue())
                            .build())
                    .collect(Collectors.toList());
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .category(product.getCategory())
                .price(product.getPrice()) // Original price
                .finalPrice(finalPrice) // Calculated final price (with discount if applicable)
                .stockQuantity(product.getStockQuantity())
                .imageUrls(product.getImageUrls())
                .tags(product.getTags())
                .brand(product.getBrand())
                .sku(product.getSku())
                .featured(product.isFeatured())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .specifications(specificationDtos)
                .discountPercentage(product.getDiscountPercentage())
                .discountStartDate(product.getDiscountStartDate())
                .discountEndDate(product.getDiscountEndDate())
                .discountActive(discountActive)
                .discountStatus(discountStatus)
                .discountAmount(discountAmount)
                .savingsPercentage(savingsPercentage)
                .build();
    }
}