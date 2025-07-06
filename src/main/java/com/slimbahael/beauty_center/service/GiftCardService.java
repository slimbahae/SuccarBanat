package com.slimbahael.beauty_center.service;

import com.slimbahael.beauty_center.model.GiftCard;
import com.slimbahael.beauty_center.model.BalanceTransaction;
import com.slimbahael.beauty_center.model.User;
import com.slimbahael.beauty_center.repository.GiftCardRepository;
import com.slimbahael.beauty_center.repository.UserRepository;
import com.slimbahael.beauty_center.exception.ResourceNotFoundException;
import com.slimbahael.beauty_center.exception.BadRequestException;
import com.slimbahael.beauty_center.dto.GiftCardPurchaseRequest;
import com.slimbahael.beauty_center.dto.GiftCardRedemptionRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Calendar;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class GiftCardService {

    private final GiftCardRepository giftCardRepository;
    private final UserRepository userRepository;
    private final BalanceService balanceService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    private static final int CODE_LENGTH = 32;
    private static final int MAX_REDEMPTION_ATTEMPTS = 5;
    private static final int MAX_VERIFICATION_ATTEMPTS = 10;
    private static final int EXPIRATION_MONTHS = 6;

    @Transactional
    public GiftCard createGiftCard(GiftCardPurchaseRequest request) {
        // Generate secure code
        String rawCode = generateSecureCode();
        String codeHash = passwordEncoder.encode(rawCode);

        // Generate verification token for admin use
        String verificationToken = generateVerificationToken();

        // Calculate expiration date (6 months from now)
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MONTH, EXPIRATION_MONTHS);
        Date expirationDate = calendar.getTime();

        GiftCard giftCard = GiftCard.builder()
                .codeHash(codeHash)
                .type(request.getType())
                .amount(request.getAmount())
                .status("ACTIVE")
                .purchaserEmail(request.getPurchaserEmail())
                .purchaserName(request.getPurchaserName())
                .recipientEmail(request.getRecipientEmail())
                .recipientName(request.getRecipientName())
                .message(request.getMessage())
                .expirationDate(expirationDate)
                .verificationToken(verificationToken)
                .paymentIntentId(request.getPaymentIntentId())
                .build();

        GiftCard savedGiftCard = giftCardRepository.save(giftCard);

        // Record purchase transaction if purchaser is a user
        recordPurchaseTransaction(request, savedGiftCard.getId());

        // Send emails
        emailService.sendGiftCardPurchaseConfirmation(request.getPurchaserEmail(), savedGiftCard, rawCode);
        emailService.sendGiftCardReceived(request.getRecipientEmail(), savedGiftCard, rawCode);

        log.info("Gift card created: {} for recipient: {}", savedGiftCard.getId(), request.getRecipientEmail());

        return savedGiftCard;
    }

    @Transactional
    public BalanceTransaction redeemGiftCard(String code, String userId, String ipAddress) {
        // Find gift card by code
        Optional<GiftCard> giftCardOpt = findGiftCardByCode(code);

        if (giftCardOpt.isEmpty()) {
            log.warn("Gift card redemption failed - invalid code from IP: {}", ipAddress);
            throw new BadRequestException("Code cadeau invalide");
        }

        GiftCard giftCard = giftCardOpt.get();

        // Validate redemption
        validateRedemption(giftCard, userId, ipAddress);

        // Only balance type can be redeemed directly
        if (!"BALANCE".equals(giftCard.getType())) {
            throw new BadRequestException("Ce type de carte cadeau ne peut pas être utilisé pour recharger le solde");
        }

        // Update gift card status
        giftCard.setStatus("REDEEMED");
        giftCard.setRedeemedAt(new Date());
        giftCard.setRedeemedByUserId(userId);
        giftCard.setLastRedemptionAttempt(new Date());
        giftCard.setLastRedemptionIp(ipAddress);
        giftCardRepository.save(giftCard);

        // Add balance to user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BalanceTransaction transaction = balanceService.creditBalance(
                userId,
                giftCard.getAmount(),
                "Utilisation carte cadeau - " + giftCard.getId().substring(0, 8),
                "GIFT_CARD_REDEEM",
                giftCard.getId()
        );

        // Send confirmation emails
        emailService.sendGiftCardRedemptionConfirmation(user.getEmail(), giftCard);
        emailService.sendGiftCardRedeemedNotification(giftCard.getPurchaserEmail(), giftCard);

        log.info("Gift card redeemed: {} by user: {}", giftCard.getId(), userId);

        return transaction;
    }

    public GiftCard verifyGiftCardForAdmin(String verificationToken) {
        GiftCard giftCard = giftCardRepository.findByVerificationToken(verificationToken)
                .orElseThrow(() -> new ResourceNotFoundException("Token de vérification invalide"));

        // Update verification attempts
        giftCard.setVerificationAttempts(giftCard.getVerificationAttempts() + 1);
        giftCard.setLastVerificationAttempt(new Date());

        if (giftCard.getVerificationAttempts() > MAX_VERIFICATION_ATTEMPTS) {
            giftCard.setIsLocked(true);
            giftCard.setLockedAt(new Date());
            giftCard.setLockedReason("Trop de tentatives de vérification");
            log.warn("Gift card locked due to excessive verification attempts: {}", giftCard.getId());
        }

        giftCardRepository.save(giftCard);

        return giftCard;
    }

    @Transactional
    public void markServiceGiftCardAsUsed(String giftCardId, String adminId) {
        GiftCard giftCard = giftCardRepository.findById(giftCardId)
                .orElseThrow(() -> new ResourceNotFoundException("Carte cadeau non trouvée"));

        if (!"SERVICE".equals(giftCard.getType())) {
            throw new BadRequestException("Cette carte cadeau n'est pas de type service");
        }

        if (!"ACTIVE".equals(giftCard.getStatus())) {
            throw new BadRequestException("Cette carte cadeau n'est pas active");
        }

        giftCard.setStatus("REDEEMED");
        giftCard.setRedeemedAt(new Date());
        giftCard.setRedeemedByUserId(adminId);
        giftCardRepository.save(giftCard);

        // Send confirmation emails
        emailService.sendServiceGiftCardUsedConfirmation(giftCard.getRecipientEmail(), giftCard);
        emailService.sendServiceGiftCardUsedNotification(giftCard.getPurchaserEmail(), giftCard);

        log.info("Service gift card marked as used: {} by admin: {}", giftCardId, adminId);
    }

    public List<GiftCard> getUserPurchasedGiftCards(String email) {
        return giftCardRepository.findByPurchaserEmailOrderByCreatedAtDesc(email);
    }

    public List<GiftCard> getUserReceivedGiftCards(String email) {
        return giftCardRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public void expireGiftCards() {
        List<GiftCard> expiredCards = giftCardRepository.findExpiredActiveGiftCards(new Date());

        for (GiftCard card : expiredCards) {
            card.setStatus("EXPIRED");
            giftCardRepository.save(card);

            // Send expiration notification
            emailService.sendGiftCardExpiredNotification(card.getRecipientEmail(), card);
            emailService.sendGiftCardExpiredNotification(card.getPurchaserEmail(), card);
        }

        log.info("Expired {} gift cards", expiredCards.size());
    }

    private String generateSecureCode() {
        byte[] bytes = new byte[CODE_LENGTH];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String generateVerificationToken() {
        byte[] bytes = new byte[16];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private Optional<GiftCard> findGiftCardByCode(String code) {
        List<GiftCard> activeCards = giftCardRepository.findActiveUnlockedGiftCards();

        for (GiftCard card : activeCards) {
            if (passwordEncoder.matches(code, card.getCodeHash())) {
                return Optional.of(card);
            }
        }

        return Optional.empty();
    }

    private void validateRedemption(GiftCard giftCard, String userId, String ipAddress) {
        // Check if card is active
        if (!"ACTIVE".equals(giftCard.getStatus())) {
            throw new BadRequestException("Cette carte cadeau n'est plus active");
        }

        // Check if card is locked
        if (giftCard.getIsLocked()) {
            throw new BadRequestException("Cette carte cadeau est bloquée");
        }

        // Check expiration
        if (giftCard.getExpirationDate().before(new Date())) {
            giftCard.setStatus("EXPIRED");
            giftCardRepository.save(giftCard);
            throw new BadRequestException("Cette carte cadeau a expiré");
        }

        // Update redemption attempts
        giftCard.setRedemptionAttempts(giftCard.getRedemptionAttempts() + 1);
        giftCard.setLastRedemptionAttempt(new Date());
        giftCard.setLastRedemptionIp(ipAddress);

        // Check for too many attempts
        if (giftCard.getRedemptionAttempts() > MAX_REDEMPTION_ATTEMPTS) {
            giftCard.setIsLocked(true);
            giftCard.setLockedAt(new Date());
            giftCard.setLockedReason("Trop de tentatives d'utilisation");
            giftCardRepository.save(giftCard);
            throw new BadRequestException("Cette carte cadeau est bloquée pour sécurité");
        }
    }

    private void recordPurchaseTransaction(GiftCardPurchaseRequest request, String giftCardId) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(request.getPurchaserEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                balanceService.addTransaction(
                        user,
                        request.getAmount(),
                        "GIFT_CARD_PURCHASE",
                        "Achat carte cadeau - " + giftCardId.substring(0, 8)
                );
            }
        } catch (Exception e) {
            log.warn("Failed to record purchase transaction for gift card: {}", giftCardId, e);
        }
    }




}