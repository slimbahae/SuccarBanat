package com.slimbahael.beauty_center.controller;

import com.slimbahael.beauty_center.dto.PaymentIntentRequest;
import com.slimbahael.beauty_center.dto.PaymentIntentResponse;
import com.slimbahael.beauty_center.service.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;

    @PostMapping("/create-payment-intent")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @Valid @RequestBody PaymentIntentRequest request) {
        PaymentIntentResponse response = stripeService.createPaymentIntent(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payment-status/{paymentIntentId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<String> getPaymentStatus(@PathVariable String paymentIntentId) {
        String status = stripeService.getPaymentStatus(paymentIntentId);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/cancel-payment/{paymentIntentId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<String> cancelPayment(@PathVariable String paymentIntentId) {
        stripeService.cancelPaymentIntent(paymentIntentId);
        return ResponseEntity.ok("Payment cancelled successfully");
    }
}