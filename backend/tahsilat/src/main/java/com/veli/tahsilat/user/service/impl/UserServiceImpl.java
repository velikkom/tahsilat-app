package com.veli.tahsilat.user.service.impl;

import com.veli.tahsilat.user.dto.response.UserResponse;

import com.veli.tahsilat.user.entity.User;

import com.veli.tahsilat.user.repository.UserRepository;

import com.veli.tahsilat.user.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl
        implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow();

        return UserResponse.builder()

                .id(user.getId())

                .firstName(user.getFirstName())

                .lastName(user.getLastName())

                .email(user.getEmail())

                .role(user.getRole())

                .active(user.getActive())

                .build();
    }
}