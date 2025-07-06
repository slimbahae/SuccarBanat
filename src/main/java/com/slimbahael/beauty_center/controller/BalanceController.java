package com.slimbahael.beauty_center.controller;

import com.slimbahael.beauty_center.model.BalanceTransaction;
import com.slimbahael.beauty_center.model.User;
import com.slimbahael.beauty_center.service.BalanceService;
import com.slimbahael.beauty_center.repository.UserRepository;
import com.slimbahael.beauty_center.dto.BalanceAdjustmentRequest;
import com.slimbahael.beauty_center.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;
    private final UserRepository userRepository;

    @GetMapping("/customer/balance")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getCustomerBalance(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        BigDecimal balance = balanceService.getUserBalance(user.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("balance", balance);
        result.put("formatted", String.format("€%.2f", balance));
        result.put("lastUpdated", user.getLastBalanceUpdate()); // may be null, which is okay with HashMap

        return ResponseEntity.ok(result);
    }

    @GetMapping("/customer/balance/transactions")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<BalanceTransaction>> getCustomerTransactionHistory(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<BalanceTransaction> transactions = balanceService.getUserTransactionHistory(user.getId());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/admin/users/{userId}/balance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserBalance(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        BigDecimal balance = balanceService.getUserBalance(userId);
        List<BalanceTransaction> recentTransactions = balanceService.getUserTransactionHistory(userId);

        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "userName", user.getFirstName() + " " + user.getLastName(),
                "balance", balance,
                "formatted", String.format("€%.2f", balance),
                "lastUpdated", user.getLastBalanceUpdate(),
                "recentTransactions", recentTransactions.stream().limit(5).toList()
        ));
    }

    @PostMapping("/admin/users/{userId}/balance/adjust")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BalanceTransaction> adjustUserBalance(
            @PathVariable String userId,
            @Valid @RequestBody BalanceAdjustmentRequest request,
            Authentication authentication) {

        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        BalanceTransaction transaction = balanceService.adminAdjustBalance(
                userId,
                request.getAmount(),
                request.getDescription(),
                admin.getId()
        );

        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/customer/balance/add")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> addFundsToBalance(
            @Valid @RequestBody Map<String, BigDecimal> request,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        BigDecimal amount = request.get("amount");

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Montant invalide"));
        }

        // Ajoute le montant au solde
        user.setBalance(user.getBalance().add(amount));
        userRepository.save(user);

        // (Optionnel) Ajoute une transaction dans l'historique
        balanceService.addTransaction(user, amount, "CREDIT", "Recharge de solde");

        return ResponseEntity.ok(Map.of(
                "message", "Solde rechargé avec succès",
                "amount", amount.toString(),
                "userId", user.getId()
        ));
    }

    @GetMapping("/admin/users/{userId}/balance/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BalanceTransaction>> getUserTransactionHistory(@PathVariable String userId) {
        List<BalanceTransaction> transactions = balanceService.getUserTransactionHistory(userId);
        return ResponseEntity.ok(transactions);
    }
}