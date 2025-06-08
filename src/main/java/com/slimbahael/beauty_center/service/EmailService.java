package com.slimbahael.beauty_center.service;

import com.slimbahael.beauty_center.dto.OrderResponse;
import com.slimbahael.beauty_center.dto.ReservationResponse;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.text.SimpleDateFormat;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public void sendOrderConfirmationEmail(String to, OrderResponse order) {
        Context context = new Context();
        context.setVariable("order", order);

        String emailContent = templateEngine.process("order-confirmation", context);
        sendHtmlEmail(to, "Order Confirmed! 🎉 - Beauty Center", emailContent);
    }

    public void sendReservationConfirmationEmail(String to, ReservationResponse reservation) {
        Context context = new Context();
        context.setVariable("reservation", reservation);
        context.setVariable("reservationDateFormatted", 
            new SimpleDateFormat("MMMM dd, yyyy").format(reservation.getReservationDate()));

        String emailContent = templateEngine.process("reservation-confirmation", context);
        sendHtmlEmail(to, "Reservation Confirmed! 🎉 - Beauty Center", emailContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply@beautycenter.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
} 