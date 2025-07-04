package com.slimbahael.beauty_center.service;

import com.slimbahael.beauty_center.dto.JwtAuthResponse;
import com.slimbahael.beauty_center.dto.LoginRequest;
import com.slimbahael.beauty_center.dto.RegisterRequest;
import com.slimbahael.beauty_center.exception.ResourceAlreadyExistsException;
import com.slimbahael.beauty_center.model.EmailVerificationToken;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.util.Optional;
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
    private final EmailService emailService;
    private final EmailVerificationTokenService tokenService;

    @Value("${recaptcha.secret.key}")
    private String recaptchaSecretKey;

    private final RestTemplate restTemplate = new RestTemplate();

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
                throw new DisabledException("Account is disabled. Please verify your email address.");
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
                    .enabled(false) // Set to false initially, will be enabled after email verification
                    .build();

            userRepository.save(user);

            // Create verification token and send verification email
            String verificationToken = tokenService.createEmailVerificationToken(email);
            emailService.sendEmailVerification(email, verificationToken, firstName);

            log.info("New user registered successfully: {} with role: {}", email, role);

        } catch (Exception e) {
            log.error("Failed to register user: {}", email, e);
            throw new RuntimeException("Failed to register user. Please try again.");
        }
    }

    public boolean verifyEmail(String token) {
        Optional<EmailVerificationToken> tokenOpt = tokenService.validateToken(token);

        if (tokenOpt.isPresent()) {
            EmailVerificationToken verificationToken = tokenOpt.get();

            if ("EMAIL_VERIFICATION".equals(verificationToken.getTokenType())) {
                // Find and activate the user
                User user = userRepository.findByEmail(verificationToken.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found"));

                // Mark user as verified
                user.setEnabled(true);
                userRepository.save(user);

                // Mark token as used
                tokenService.markTokenAsUsed(token);

                // Send welcome email
                emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

                log.info("Email verified successfully for user: {}", user.getEmail());
                return true;
            }
        }

        return false;
    }

    public void resendVerificationEmail(String email) {
        email = inputSanitizationService.sanitizeEmail(email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEnabled()) {
            throw new RuntimeException("Email is already verified");
        }

        // Delete any existing verification tokens for this email
        tokenService.deleteTokensByEmail(email);

        // Create new verification token
        String token = tokenService.createEmailVerificationToken(email);

        // Send verification email
        emailService.sendEmailVerification(email, token, user.getFirstName());

        log.info("Verification email resent to: {}", email);
    }

    public void initiatePasswordReset(String email, String recaptchaToken) {
        // Verify reCAPTCHA
        if (!verifyRecaptcha(recaptchaToken)) {
            throw new RuntimeException("reCAPTCHA verification failed. Please try again.");
        }
        email = inputSanitizationService.sanitizeEmail(email);

        User user = userRepository.findByEmail(email).orElse(null);

        // Don't reveal whether email exists (security best practice)
        if (user != null && user.isEnabled()) {
            // Delete any existing password reset tokens for this email
            tokenService.deleteTokensByEmail(email);

            // Create password reset token
            String token = tokenService.createPasswordResetToken(email);

            // Send password reset email
            emailService.sendPasswordReset(email, token, user.getFirstName());

            log.info("Password reset email sent to: {}", email);
        } else {
            log.warn("Password reset requested for non-existent or disabled email: {}", email);
        }
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<EmailVerificationToken> tokenOpt = tokenService.validateToken(token);

        if (tokenOpt.isPresent()) {
            EmailVerificationToken resetToken = tokenOpt.get();

            if ("PASSWORD_RESET".equals(resetToken.getTokenType())) {
                // Validate new password
                PasswordValidationService.PasswordValidationResult passwordValidation =
                        passwordValidationService.validatePassword(newPassword);

                if (!passwordValidation.isValid()) {
                    throw new IllegalArgumentException("Password validation failed: " + passwordValidation.getErrorMessage());
                }

                // Find user and update password
                User user = userRepository.findByEmail(resetToken.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found"));

                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);

                // Mark token as used
                tokenService.markTokenAsUsed(token);

                log.info("Password reset successfully for user: {}", user.getEmail());
                return true;
            }
        }

        return false;
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
        // This method is deprecated - use initiatePasswordReset instead
        initiatePasswordReset(email, null);
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

    private boolean verifyRecaptcha(String recaptchaToken) {
        String url = "https://www.google.com/recaptcha/api/siteverify";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/x-www-form-urlencoded");
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", recaptchaSecretKey);
        params.add("response", recaptchaToken);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            String body = response.getBody();
            return body != null && body.contains("\"success\": true");
        } catch (Exception e) {
            log.error("Error verifying reCAPTCHA: {}", e.getMessage());
            return false;
        }
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