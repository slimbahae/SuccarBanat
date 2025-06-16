// src/main/java/com/slimbahael/beauty_center/service/AuthService.java
package com.slimbahael.beauty_center.service;

import com.slimbahael.beauty_center.dto.JwtAuthResponse;
import com.slimbahael.beauty_center.dto.LoginRequest;
import com.slimbahael.beauty_center.dto.RegisterRequest;
import com.slimbahael.beauty_center.exception.ResourceAlreadyExistsException;
import com.slimbahael.beauty_center.model.User;
import com.slimbahael.beauty_center.repository.UserRepository;
import com.slimbahael.beauty_center.security.JwtTokenProvider;
import com.slimbahael.beauty_center.security.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final InputSanitizationService inputSanitizationService;
    private final PasswordValidationService passwordValidationService;

    // Track failed login attempts per IP/email
    private final ConcurrentHashMap<String, FailedLoginAttempt> failedAttempts = new ConcurrentHashMap<>();

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;

    public JwtAuthResponse login(LoginRequest loginRequest) {
        // Sanitize input
        String email = inputSanitizationService.sanitizeEmail(loginRequest.getEmail());
        String password = loginRequest.getPassword();

        if (password == null || password.trim().isEmpty()) {
            throw new BadCredentialsException("Password cannot be empty");
        }

        // Check for brute force attempts
        String attemptKey = email.toLowerCase();
        if (isAccountLocked(attemptKey)) {
            log.warn("Login attempt on locked account: {}", email);
            throw new LockedException("Account temporarily locked due to too many failed attempts. Please try again later.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

            // Verify user account status
            if (!user.isEnabled()) {
                throw new DisabledException("Account is disabled");
            }

            // Clear failed attempts on successful login
            clearFailedAttempts(attemptKey);

            String jwt = tokenProvider.generateToken(authentication);

            log.info("Successful login for user: {}", email);

            return new JwtAuthResponse(
                    jwt,
                    "Bearer",
                    user.getRole(),
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail()
            );

        } catch (AuthenticationException e) {
            // Record failed attempt
            recordFailedAttempt(attemptKey);

            log.warn("Failed login attempt for email: {} - {}", email, e.getMessage());

            // Don't reveal specific failure reason for security
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    public void register(RegisterRequest registerRequest) {
        // Sanitize all inputs
        String firstName = inputSanitizationService.sanitizeAlphanumeric(registerRequest.getFirstName());
        String lastName = inputSanitizationService.sanitizeAlphanumeric(registerRequest.getLastName());
        String email = inputSanitizationService.sanitizeEmail(registerRequest.getEmail());
        String password = registerRequest.getPassword();
        String phoneNumber = registerRequest.getPhoneNumber();
        String role = registerRequest.getRole();

        // Validate password strength
        PasswordValidationService.PasswordValidationResult passwordValidation =
                passwordValidationService.validatePassword(password);

        if (!passwordValidation.isValid()) {
            throw new IllegalArgumentException("Password validation failed: " + passwordValidation.getErrorMessage());
        }

        // Sanitize phone number if provided
        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            phoneNumber = inputSanitizationService.sanitizePhoneNumber(phoneNumber);
        }

        // Validate role
        if (role == null || role.trim().isEmpty()) {
            role = "CUSTOMER"; // Default role
        } else {
            role = role.toUpperCase().trim();
            if (!role.equals("CUSTOMER") && !role.equals("STAFF") && !role.equals("ADMIN")) {
                throw new IllegalArgumentException("Invalid role specified");
            }
        }

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            log.warn("Registration attempt with existing email: {}", email);
            throw new ResourceAlreadyExistsException("Email is already registered");
        }

        try {
            User user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .phoneNumber(phoneNumber)
                    .role(role)
                    .enabled(true)
                    .build();

            userRepository.save(user);

            log.info("New user registered successfully: {} with role: {}", email, role);

        } catch (Exception e) {
            log.error("Failed to register user: {}", email, e);
            throw new RuntimeException("Failed to register user. Please try again.");
        }
    }

    public void logout(String token) {
        if (token != null && !token.trim().isEmpty()) {
            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // Add token to blacklist
            tokenBlacklistService.blacklistToken(token);

            // Clear security context
            SecurityContextHolder.clearContext();

            log.info("User logged out successfully");
        }
    }

    public void changePassword(String currentPassword, String newPassword) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        // Validate new password
        PasswordValidationService.PasswordValidationResult passwordValidation =
                passwordValidationService.validatePassword(newPassword);

        if (!passwordValidation.isValid()) {
            throw new IllegalArgumentException("New password validation failed: " + passwordValidation.getErrorMessage());
        }

        // Check if new password is different from current
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", email);
    }

    public void requestPasswordReset(String email) {
        email = inputSanitizationService.sanitizeEmail(email);

        User user = userRepository.findByEmail(email).orElse(null);

        // Don't reveal whether email exists or not (security best practice)
        log.info("Password reset requested for email: {}", email);

        if (user != null && user.isEnabled()) {
            // In a real implementation, you would:
            // 1. Generate a secure reset token
            // 2. Store it with expiration time
            // 3. Send email with reset link
            log.info("Password reset token would be sent to: {}", email);
        }
    }

    private boolean isAccountLocked(String attemptKey) {
        FailedLoginAttempt attempt = failedAttempts.get(attemptKey);
        if (attempt == null) {
            return false;
        }

        if (attempt.getAttemptCount() >= MAX_LOGIN_ATTEMPTS) {
            LocalDateTime lockoutExpiry = attempt.getLastAttempt().plusMinutes(LOCKOUT_DURATION_MINUTES);
            if (LocalDateTime.now().isBefore(lockoutExpiry)) {
                return true;
            } else {
                // Lockout period expired, clear the record
                failedAttempts.remove(attemptKey);
                return false;
            }
        }

        return false;
    }

    private void recordFailedAttempt(String attemptKey) {
        failedAttempts.compute(attemptKey, (key, attempt) -> {
            if (attempt == null) {
                return new FailedLoginAttempt(1, LocalDateTime.now());
            } else {
                return new FailedLoginAttempt(attempt.getAttemptCount() + 1, LocalDateTime.now());
            }
        });
    }

    private void clearFailedAttempts(String attemptKey) {
        failedAttempts.remove(attemptKey);
    }

    // Cleanup old failed attempts periodically
    public void cleanupFailedAttempts() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);
        failedAttempts.entrySet().removeIf(entry ->
                entry.getValue().getLastAttempt().isBefore(cutoff));
    }

    private static class FailedLoginAttempt {
        private final int attemptCount;
        private final LocalDateTime lastAttempt;

        public FailedLoginAttempt(int attemptCount, LocalDateTime lastAttempt) {
            this.attemptCount = attemptCount;
            this.lastAttempt = lastAttempt;
        }

        public int getAttemptCount() {
            return attemptCount;
        }

        public LocalDateTime getLastAttempt() {
            return lastAttempt;
        }
    }
}