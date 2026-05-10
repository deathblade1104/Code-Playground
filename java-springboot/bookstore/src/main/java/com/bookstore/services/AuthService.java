package com.bookstore.services;

import com.bookstore.domain.user.Role;
import com.bookstore.domain.user.User;
import com.bookstore.dto.AuthResponse;
import com.bookstore.dto.LoginRequest;
import com.bookstore.dto.SignupRequest;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Determine role (default to CUSTOMER)
        Role role = Role.CUSTOMER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("ADMIN")) {
            role = Role.ADMIN;
        }

        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered: {}", savedUser.getEmail());

        // Generate JWT token
        String token = jwtService.generateToken(savedUser.getId(), savedUser.getRole());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getName(),
                savedUser.getRole()
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        log.info("User logged in: {}", user.getEmail());

        // Generate JWT token
        String token = jwtService.generateToken(user.getId(), user.getRole());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole()
        );
    }

    public void logout(String token) {
        // In a stateless JWT system, logout is typically handled client-side
        // You could implement token blacklisting here if needed
        jwtService.invalidateToken(token);
        log.info("User logged out");
    }
}

