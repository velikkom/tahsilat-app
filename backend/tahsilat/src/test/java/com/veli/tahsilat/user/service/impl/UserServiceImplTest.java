package com.veli.tahsilat.user.service.impl;

import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.common.exception.ResourceNotFoundException;
import com.veli.tahsilat.user.dto.response.UserResponse;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.enums.Role;
import com.veli.tahsilat.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userServiceImpl;

    private final UUID otherUserId = UUID.randomUUID();
    private final UUID currentUserId = UUID.randomUUID();

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null)
        );
    }

    @Test
    void deactivateUser_shouldRejectSelfDeactivation() {
        User currentUser = User.builder()
                .id(currentUserId)
                .email("me@test.com")
                .active(true)
                .currentSessionId(UUID.randomUUID())
                .build();

        when(userRepository.findById(currentUserId)).thenReturn(Optional.of(currentUser));
        authenticateAs("me@test.com");

        assertThrows(
                BusinessException.class,
                () -> userServiceImpl.deactivateUser(currentUserId)
        );

        verify(userRepository, never()).save(any());
    }

    @Test
    void deactivateUser_shouldDeactivateAndClearSessionForOtherUser() {
        UUID sessionId = UUID.randomUUID();
        User targetUser = User.builder()
                .id(otherUserId)
                .email("other@test.com")
                .active(true)
                .currentSessionId(sessionId)
                .build();

        when(userRepository.findById(otherUserId)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(targetUser)).thenReturn(targetUser);
        authenticateAs("me@test.com");

        UserResponse response = userServiceImpl.deactivateUser(otherUserId);

        assertFalse(targetUser.getActive());
        assertNull(targetUser.getCurrentSessionId());
        assertFalse(response.getActive());
        verify(userRepository).save(targetUser);
    }

    @Test
    void deactivateUser_shouldThrowWhenUserNotFound() {
        UUID missingId = UUID.randomUUID();
        when(userRepository.findById(missingId)).thenReturn(Optional.empty());
        authenticateAs("me@test.com");

        assertThrows(
                ResourceNotFoundException.class,
                () -> userServiceImpl.deactivateUser(missingId)
        );
    }

    @Test
    void activateUser_shouldActivateAndClearNewUserFlag() {
        User targetUser = User.builder()
                .id(otherUserId)
                .email("other@test.com")
                .active(false)
                .newUser(true)
                .build();

        when(userRepository.findById(otherUserId)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(targetUser)).thenReturn(targetUser);

        UserResponse response = userServiceImpl.activateUser(otherUserId);

        assertEquals(true, targetUser.getActive());
        assertEquals(false, targetUser.getNewUser());
        assertEquals(true, response.getActive());
    }

    @Test
    void updateUserRole_shouldUpdateRole() {
        User targetUser = User.builder()
                .id(otherUserId)
                .email("other@test.com")
                .role(Role.ROLE_SALESMAN)
                .build();

        when(userRepository.findById(otherUserId)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(targetUser)).thenReturn(targetUser);

        UserResponse response = userServiceImpl.updateUserRole(otherUserId, Role.ROLE_ADMIN);

        assertEquals(Role.ROLE_ADMIN, targetUser.getRole());
        assertEquals(Role.ROLE_ADMIN, response.getRole());
    }
}
