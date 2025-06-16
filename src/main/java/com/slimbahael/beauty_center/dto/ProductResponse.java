// Enhanced ProductResponse.java with discount fields
package com.slimbahael.beauty_center.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private String id;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private Integer stockQuantity;
    private List<String> imageUrls;
    private List<String> tags;
    private String brand;
    private String sku;
    private boolean featured;
    private boolean active;
    private Date createdAt;
    private Date updatedAt;
    private List<ProductSpecificationDto> specifications;

    // Discount fields
    private BigDecimal discountPercentage;
    private Date discountStartDate;
    private Date discountEndDate;
    private BigDecimal finalPrice; // Price after applying discount
    private boolean discountActive; // Whether discount is currently active
    private String discountStatus; // ACTIVE, SCHEDULED, EXPIRED, NO_DISCOUNT, INVALID_DATES

    // Calculated fields for better frontend handling
    private BigDecimal discountAmount; // Absolute discount amount
    private BigDecimal savingsPercentage; // Actual savings percentage

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductSpecificationDto {
        private String name;
        private String value;
    }

    // Helper methods for discount calculations
    public BigDecimal getDiscountAmount() {
        if (price != null && finalPrice != null && finalPrice.compareTo(price) < 0) {
            return price.subtract(finalPrice);
        }
        return BigDecimal.ZERO;
    }

    public BigDecimal getSavingsPercentage() {
        if (price != null && finalPrice != null && price.compareTo(BigDecimal.ZERO) > 0 && finalPrice.compareTo(price) < 0) {
            return price.subtract(finalPrice)
                    .multiply(new BigDecimal("100"))
                    .divide(price, 2, java.math.RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    public boolean hasDiscount() {
        return discountPercentage != null &&
                discountPercentage.compareTo(BigDecimal.ZERO) > 0 &&
                discountStartDate != null &&
                discountEndDate != null;
    }

    public boolean hasActiveDiscount() {
        return discountActive && finalPrice != null && price != null && finalPrice.compareTo(price) < 0;
    }

    public boolean isDiscountExpired() {
        return "EXPIRED".equals(discountStatus);
    }

    public boolean isDiscountScheduled() {
        return "SCHEDULED".equals(discountStatus);
    }
}