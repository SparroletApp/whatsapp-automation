
package com.example.whatsapp.service.impl;

import com.example.whatsapp.dto.AuthResponseDto;
import com.example.whatsapp.dto.userdto.CreateUserDto;
import com.example.whatsapp.dto.userdto.LoginUserDto;
import com.example.whatsapp.dto.userdto.UserResponseDto;

import com.example.whatsapp.entity.User;
import com.example.whatsapp.repository.UserRepository;
import com.example.whatsapp.service.JwtService;
import com.example.whatsapp.service.UserService;


import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    @Override
    public AuthResponseDto createUser(CreateUserDto request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole("USER");
        user.setStatus(true);

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getEmail());

        return buildAuthResponse(
                savedUser,
                token,
                "Registration successful"
        );
    }

    @Override
    public AuthResponseDto login(LoginUserDto request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        if (!Boolean.TRUE.equals(user.getStatus())) {
            throw new RuntimeException("Your account is inactive");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return buildAuthResponse(
                user,
                token,
                "Login successful"
        );
    }

    private AuthResponseDto buildAuthResponse(
            User user,
            String token,
            String message
    ) {

        UserResponseDto userResponse = new UserResponseDto();

        userResponse.setId(user.getId());
        userResponse.setName(user.getName());
        userResponse.setEmail(user.getEmail());
        userResponse.setPhone(user.getPhone());
        userResponse.setRole(user.getRole());
        userResponse.setStatus(user.getStatus());
        userResponse.setCreatedAt(user.getCreatedAt());

        AuthResponseDto response = new AuthResponseDto();

        response.setMessage(message);
        response.setToken(token);
        response.setUser(userResponse);

        return response;
    }
}
