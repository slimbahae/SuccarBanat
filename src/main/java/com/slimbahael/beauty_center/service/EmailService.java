package com.slimbahael.beauty_center.service;

import com.slimbahael.beauty_center.dto.OrderResponse;
import com.slimbahael.beauty_center.dto.ProductResponse;
import com.slimbahael.beauty_center.dto.ReservationResponse;
import com.slimbahael.beauty_center.dto.UserResponse;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.business.email}")
    private String fromEmail;

    @Value("${app.admin.email:admin@beautycenter.com}")
    private String adminEmail;

    @Value("${app.business.name:Beauty Center}")
    private String businessName;

    @Value("${app.business.email:noreply@beautycenter.com}")
    private String businessEmail;

    public void sendEmailVerification(String toEmail, String verificationToken, String firstName) {
        try {
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("verificationUrl", "http://localhost:3000/verify-email?token=" + verificationToken);
            context.setVariable("businessName", businessName);

            sendTemplatedEmail(toEmail, "Verify Your Email - " + businessName, "email-verification", context);
            log.info("Email verification sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send email verification to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email");
        }
    }

    public void sendPasswordReset(String toEmail, String resetToken, String firstName) {
        try {
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("resetUrl", "http://localhost:3000/reset-password?token=" + resetToken);
            context.setVariable("businessName", businessName);

            sendTemplatedEmail(toEmail, "Password Reset - " + businessName, "password-reset", context);
            log.info("Password reset email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("businessName", businessName);

            sendTemplatedEmail(toEmail, "Welcome to " + businessName + "! 🎉", "welcome", context);
            log.info("Welcome email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send welcome email");
        }
    }

    public void sendOrderStatusUpdateEmail(String toEmail, OrderResponse order, String status) {
        try {
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("businessName", businessName);
            context.setVariable("status", status);
            context.setVariable("orderTotal", formatCurrencyEuro(order.getTotal()));

            String emailContent = templateEngine.process("order-status-update", context);
            sendHtmlEmail(toEmail, "Order Status Update - " + businessName, emailContent);

            log.info("Order status update email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send order status update email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendReservationReminderEmail(String toEmail, ReservationResponse reservation) {
        try {
            Context context = new Context();
            context.setVariable("reservation", reservation);
            context.setVariable("businessName", businessName);
            context.setVariable("reservationDateFormatted",
                    new SimpleDateFormat("MMMM dd, yyyy 'at' HH:mm").format(reservation.getReservationDate()));

            String emailContent = templateEngine.process("reservation-reminder", context);
            sendHtmlEmail(toEmail, "Appointment Reminder - " + businessName, emailContent);

            log.info("Reservation reminder email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reservation reminder email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendDailySummaryToAdmin(DailySummaryData summaryData) {
        try {
            Context context = new Context();
            context.setVariable("summary", summaryData);
            context.setVariable("businessName", businessName);
            context.setVariable("dateFormatted",
                    new SimpleDateFormat("MMMM dd, yyyy", Locale.FRENCH).format(summaryData.getDate()));
            context.setVariable("totalRevenueFormatted", formatCurrencyEuro(summaryData.getTotalRevenue()));

            String emailContent = templateEngine.process("admin-daily-summary", context);
            sendHtmlEmail(adminEmail,
                    "📊 Résumé Quotidien - " + businessName,
                    emailContent);

            log.info("Daily summary email sent to admin for date: {}", summaryData.getDate());
        } catch (Exception e) {
            log.error("Failed to send daily summary email to admin: {}", e.getMessage());
        }
    }

    public void sendNewUserRegistrationNotificationToAdmin(UserResponse user) {
        try {
            Context context = new Context();
            context.setVariable("user", user);
            context.setVariable("businessName", businessName);

            String emailContent = templateEngine.process("admin-new-user", context);
            sendHtmlEmail(adminEmail,
                    "👤 Nouvel Utilisateur - " + user.getFirstName() + " " + user.getLastName() + " - " + businessName,
                    emailContent);

            log.info("New user registration notification sent to admin for user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send new user registration notification to admin for user {}: {}",
                    user.getEmail(), e.getMessage());
        }
    }

    // =================== CUSTOMER NOTIFICATIONS ===================

    public void sendOrderConfirmationEmail(String to, OrderResponse order) {
        try {
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("businessName", businessName);

            String emailContent = templateEngine.process("order-confirmation", context);
            sendHtmlEmail(to, "Order Confirmed! 🎉 - " + businessName, emailContent);

            log.info("Order confirmation email sent to customer: {}", to);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email to {}: {}", to, e.getMessage());
        }
    }

    public void sendReservationConfirmationEmail(String to, ReservationResponse reservation) {
        try {
            Context context = new Context();
            context.setVariable("reservation", reservation);
            context.setVariable("businessName", businessName);
            context.setVariable("reservationDateFormatted",
                    new SimpleDateFormat("MMMM dd, yyyy").format(reservation.getReservationDate()));

            String emailContent = templateEngine.process("reservation-confirmation", context);
            sendHtmlEmail(to, "Reservation Confirmed! 🎉 - " + businessName, emailContent);

            log.info("Reservation confirmation email sent to customer: {}", to);
        } catch (Exception e) {
            log.error("Failed to send reservation confirmation email to {}: {}", to, e.getMessage());
        }
    }

    // =================== ADMIN NOTIFICATIONS ===================

    public void sendNewOrderNotificationToAdmin(OrderResponse order) {
        try {
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("businessName", businessName);
            context.setVariable("orderTotal", formatCurrency(order.getTotal()));
            context.setVariable("itemCount", order.getItems().size());

            String emailContent = templateEngine.process("admin-nouvelle-commande", context);
            sendHtmlEmail(adminEmail,
                    "🛍️ Nouvelle Commande - " + formatCurrency(order.getTotal()) + " - " + businessName,
                    emailContent);

            log.info("Notification de nouvelle commande envoyée à l'admin pour la commande: {}", order.getId());
        } catch (Exception e) {
            log.error("Échec de l'envoi de la notification de nouvelle commande à l'admin pour la commande {}: {}",
                    order.getId(), e.getMessage());
        }
    }

    public void sendNewReservationNotificationToAdmin(ReservationResponse reservation) {
        try {
            Context context = new Context();
            context.setVariable("reservation", reservation);
            context.setVariable("businessName", businessName);
            context.setVariable("reservationDateFormatted",
                    new SimpleDateFormat("d MMMM yyyy", Locale.FRENCH).format(reservation.getReservationDate()));
            context.setVariable("reservationTotal", formatCurrencyEuro(reservation.getTotalAmount()));

            String emailContent = templateEngine.process("admin-nouvelle-reservation", context);
            sendHtmlEmail(adminEmail,
                    "📅 Nouvelle Réservation - " + reservation.getServiceName() + " - " + businessName,
                    emailContent);

            log.info("Notification de nouvelle réservation envoyée à l'admin pour la réservation: {}", reservation.getId());
        } catch (Exception e) {
            log.error("Échec de l'envoi de la notification de nouvelle réservation à l'admin pour la réservation {}: {}",
                    reservation.getId(), e.getMessage());
        }
    }

    public void sendProductAddedNotificationToAdmin(ProductResponse product, String addedByUser) {
        try {
            Context context = new Context();
            context.setVariable("product", product);
            context.setVariable("businessName", businessName);
            context.setVariable("addedByUser", addedByUser);
            context.setVariable("productPrice", formatCurrencyEuro(product.getPrice()));

            String emailContent = templateEngine.process("admin-nouveau-produit", context);
            sendHtmlEmail(adminEmail,
                    "📦 Nouveau Produit - " + product.getName() + " - " + businessName,
                    emailContent);

            log.info("Notification de produit ajouté envoyée à l'admin pour le produit: {}", product.getName());
        } catch (Exception e) {
            log.error("Échec de l'envoi de la notification de produit ajouté à l'admin pour le produit {}: {}",
                    product.getName(), e.getMessage());
        }
    }

    public void sendLowStockNotificationToAdmin(ProductResponse product) {
        try {
            Context context = new Context();
            context.setVariable("product", product);
            context.setVariable("businessName", businessName);

            String emailContent = templateEngine.process("admin-stock-faible", context);
            sendHtmlEmail(adminEmail,
                    "⚠️ Stock Faible - " + product.getName() + " - " + businessName,
                    emailContent);

            log.info("Notification de stock faible envoyée à l'admin pour le produit: {}", product.getName());
        } catch (Exception e) {
            log.error("Échec de l'envoi de la notification de stock faible à l'admin pour le produit {}: {}",
                    product.getName(), e.getMessage());
        }
    }

    public void sendCancelledOrderNotificationToAdmin(OrderResponse order, String reason) {
        try {
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("businessName", businessName);
            context.setVariable("reason", reason);
            context.setVariable("orderTotal", formatCurrencyEuro(order.getTotal()));

            String emailContent = templateEngine.process("admin-commande-annulee", context);
            sendHtmlEmail(adminEmail,
                    "❌ Commande Annulée - " + formatCurrencyEuro(order.getTotal()) + " - " + businessName,
                    emailContent);

            log.info("Notification de commande annulée envoyée à l'admin pour la commande: {}", order.getId());
        } catch (Exception e) {
            log.error("Échec de l'envoi de la notification de commande annulée à l'admin pour la commande {}: {}",
                    order.getId(), e.getMessage());
        }
    }

    // =================== HELPER METHODS ===================

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(businessEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private void sendTemplatedEmail(String toEmail, String subject, String templateName, Context context) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Process the specific template content
            String emailContent = templateEngine.process(templateName, context);

            // Set content in base template context
            Context baseContext = new Context();
            baseContext.setVariable("businessName", businessName);
            baseContext.setVariable("emailTitle", subject);
            baseContext.setVariable("emailContent", emailContent);

            // Process the base template with content
            String finalHtml = templateEngine.process("base-email", baseContext);

            helper.setTo(toEmail);
            helper.setFrom(fromEmail);
            helper.setSubject(subject);
            helper.setText(finalHtml, true);

            mailSender.send(message);
            log.info("Templated email sent to: {} with subject: {}", toEmail, subject);

        } catch (MessagingException e) {
            log.error("Failed to send templated email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email");
        }
    }

    private String formatCurrency(java.math.BigDecimal amount) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.US);
        return formatter.format(amount);
    }

    private String formatCurrencyEuro(java.math.BigDecimal amount) {
        java.text.NumberFormat formatter = java.text.NumberFormat.getCurrencyInstance(java.util.Locale.FRANCE);
        return formatter.format(amount);
    }

    // =================== DATA CLASSES ===================

    public static class DailySummaryData {
        private java.util.Date date;
        private int totalOrders;
        private java.math.BigDecimal totalRevenue;
        private int totalReservations;
        private int newCustomers;
        private java.util.List<String> topSellingProducts;
        private java.util.List<String> lowStockProducts;

        // Constructors
        public DailySummaryData() {}

        public DailySummaryData(java.util.Date date, int totalOrders, java.math.BigDecimal totalRevenue,
                                int totalReservations, int newCustomers,
                                java.util.List<String> topSellingProducts,
                                java.util.List<String> lowStockProducts) {
            this.date = date;
            this.totalOrders = totalOrders;
            this.totalRevenue = totalRevenue;
            this.totalReservations = totalReservations;
            this.newCustomers = newCustomers;
            this.topSellingProducts = topSellingProducts;
            this.lowStockProducts = lowStockProducts;
        }

        // Getters and Setters
        public java.util.Date getDate() { return date; }
        public void setDate(java.util.Date date) { this.date = date; }

        public int getTotalOrders() { return totalOrders; }
        public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }

        public java.math.BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(java.math.BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

        public int getTotalReservations() { return totalReservations; }
        public void setTotalReservations(int totalReservations) { this.totalReservations = totalReservations; }

        public int getNewCustomers() { return newCustomers; }
        public void setNewCustomers(int newCustomers) { this.newCustomers = newCustomers; }

        public java.util.List<String> getTopSellingProducts() { return topSellingProducts; }
        public void setTopSellingProducts(java.util.List<String> topSellingProducts) { this.topSellingProducts = topSellingProducts; }

        public java.util.List<String> getLowStockProducts() { return lowStockProducts; }
        public void setLowStockProducts(java.util.List<String> lowStockProducts) { this.lowStockProducts = lowStockProducts; }
    }
}