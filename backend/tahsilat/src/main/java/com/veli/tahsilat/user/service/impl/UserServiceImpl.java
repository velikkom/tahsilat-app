package com.veli.tahsilat.user.service.impl;

import com.veli.tahsilat.common.exception.ResourceNotFoundException;
import com.veli.tahsilat.user.dto.response.PendingUsersCountResponse;
import com.veli.tahsilat.user.dto.response.UserResponse;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.repository.UserRepository;
import com.veli.tahsilat.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElseThrow();

        return toResponse(user);
    }

    @Override
    public List<UserResponse> getPendingUsers() {
        return userRepository.findByActiveFalseAndNewUserTrueOrderByEmailAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByEmailAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PendingUsersCountResponse getPendingUsersCount() {
        return PendingUsersCountResponse.builder()
                .count(userRepository.countByActiveFalseAndNewUserTrue())
                .build();
    }

    @Override
    @Transactional
    public UserResponse activateUser(UUID userId) {
        User user = findUserOrThrow(userId);
        user.setActive(true);
        user.setNewUser(false);
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse deactivateUser(UUID userId) {
        User user = findUserOrThrow(userId);
        user.setActive(false);
        return toResponse(userRepository.save(user));
    }

    private User findUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.getActive())
                .newUser(user.getNewUser())
                .build();
    }
}
