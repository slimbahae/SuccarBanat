package com.slimbahael.beauty_center.service;

import com.slimbahael.beauty_center.dto.CheckoutRequest;
import com.slimbahael.beauty_center.dto.OrderResponse;
import com.slimbahael.beauty_center.exception.BadRequestException;
import com.slimbahael.beauty_center.exception.ResourceNotFoundException;
import com.slimbahael.beauty_center.model.Cart;
import com.slimbahael.beauty_center.model.Order;
import com.slimbahael.beauty_center.model.Product;
import com.slimbahael.beauty_center.model.User;
import com.slimbahael.beauty_center.repository.CartRepository;
import com.slimbahael.beauty_center.repository.OrderRepository;
import com.slimbahael.beauty_center.repository.ProductRepository;
import com.slimbahael.beauty_center.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final SmsService smsService;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.10"); // 10% tax
    private static final BigDecimal SHIPPING_COST = new BigDecimal("5.00"); // $5 shipping

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getCustomerOrders() {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return orderRepository.findByCustomerId(customer.getId())
                .stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String id) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check if user is authorized to view this order
        if (user.getRole().equals("ADMIN") || order.getCustomerId().equals(user.getId())) {
            return mapOrderToResponse(order);
        } else {
            throw new BadRequestException("You are not authorized to view this order");
        }
    }

    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get cart
        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Create order items and update product stock
        List<Order.OrderItem> orderItems = new ArrayList<>();
        for (Cart.CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + cartItem.getProductId()));

            // Check stock
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Not enough stock for product: " + product.getName());
            }

            // Update product stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            // Create order item
            Order.OrderItem orderItem = Order.OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(product.getPrice())
                    .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();

            orderItems.add(orderItem);
        }

        // Calculate totals
        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).add(SHIPPING_COST);

        // Create shipping address
        Order.ShippingAddress shippingAddress = Order.ShippingAddress.builder()
                .fullName(request.getFullName())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .phoneNumber(request.getPhoneNumber())
                .build();

        // Create order
        Order order = Order.builder()
                .customerId(customer.getId())
                .items(orderItems)
                .shippingAddress(shippingAddress)
                .subtotal(subtotal)
                .tax(tax)
                .shippingCost(SHIPPING_COST)
                .total(total)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("PAID") // For now, we'll assume all payments are successful since we're using mock payment
                .orderStatus("PROCESSING")
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Clear cart after successful order
        cartService.clearCart();

        // Send order confirmation SMS
        if (customer.getPhoneNumber() != null && !customer.getPhoneNumber().isEmpty()) {
            String message = String.format(
                    "Your order #%s has been placed and is being processed. Total: $%.2f. Thank you for shopping with Beauty Center!",
                    savedOrder.getId(),
                    total
            );
            smsService.sendSms(customer.getPhoneNumber(), message);
        }

        return mapOrderToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String id, String status) {
        // Validate status
        if (!List.of("PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED").contains(status)) {
            throw new BadRequestException("Invalid order status");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Only admin can update order status
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().equals("ADMIN")) {
            throw new BadRequestException("You are not authorized to update order status");
        }

        // If cancelling an order, restore product stock
        if (status.equals("CANCELLED") && !order.getOrderStatus().equals("CANCELLED")) {
            for (Order.OrderItem item : order.getItems()) {
                Product product = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.getProductId()));

                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setOrderStatus(status);
        order.setUpdatedAt(new Date());

        Order updatedOrder = orderRepository.save(order);

        // Send order status update SMS
        User customer = userRepository.findById(order.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (customer.getPhoneNumber() != null && !customer.getPhoneNumber().isEmpty()) {
            String message = String.format(
                    "Your order #%s has been updated to status: %s. Thank you for shopping with Beauty Center!",
                    updatedOrder.getId(),
                    status
            );
            smsService.sendSms(customer.getPhoneNumber(), message);
        }

        return mapOrderToResponse(updatedOrder);
    }

    // Helper method to map Order entity to OrderResponse DTO
    private OrderResponse mapOrderToResponse(Order order) {
        List<OrderResponse.OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> {
                    Product product = productRepository.findById(item.getProductId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

                    return OrderResponse.OrderItemDto.builder()
                            .productId(item.getProductId())
                            .productName(item.getProductName())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .totalPrice(item.getTotalPrice())
                            .imageUrl(product.getImageUrls() != null && !product.getImageUrls().isEmpty() ?
                                    product.getImageUrls().get(0) : null)
                            .build();
                })
                .collect(Collectors.toList());

        User customer = userRepository.findById(order.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .customerName(customer.getFirstName() + " " + customer.getLastName())
                .customerEmail(customer.getEmail())
                .items(itemDtos)
                .shippingAddress(OrderResponse.ShippingAddressDto.builder()
                        .fullName(order.getShippingAddress().getFullName())
                        .addressLine1(order.getShippingAddress().getAddressLine1())
                        .addressLine2(order.getShippingAddress().getAddressLine2())
                        .city(order.getShippingAddress().getCity())
                        .state(order.getShippingAddress().getState())
                        .postalCode(order.getShippingAddress().getPostalCode())
                        .country(order.getShippingAddress().getCountry())
                        .phoneNumber(order.getShippingAddress().getPhoneNumber())
                        .build())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shippingCost(order.getShippingCost())
                .total(order.getTotal())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}