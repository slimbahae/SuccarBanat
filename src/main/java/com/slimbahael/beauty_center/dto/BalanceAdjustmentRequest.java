package com.slimbahael.beauty_center.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import java.math.BigDecimal;

@Data
public class BalanceAdjustmentRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "-999999.99", message = "Amount cannot be less than -999999.99")
    @DecimalMax(value = "999999.99", message = "Amount cannot be greater than 999999.99")
    // Note: Zero amount should be validated at business logic layer if required
    private BigDecimal amount;

    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 255, message = "Description must be between 1 and 255 characters")
    private String description;
}