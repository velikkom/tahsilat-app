package com.veli.tahsilat.security.session;

import com.veli.tahsilat.common.exception.SessionTerminatedException;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionValidationServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionValidationService sessionValidationService;

    private final String email = "user@test.com";
    private final UUID sessionId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

    @Test
    void shouldThrowWhenJwtSessionIdIsNull() {
        assertThrows(
                SessionTerminatedException.class,
                () -> sessionValidationService.validateSession(email, null)
        );

        verifyNoInteractions(userRepository);
    }

    @Test
    void shouldThrowWhenUserNotFound() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(
                SessionTerminatedException.class,
                () -> sessionValidationService.validateSession(email, sessionId)
        );
    }

    @Test
    void shouldThrowWhenUserIsInactive() {
        User user = User.builder()
                .email(email)
                .active(false)
                .currentSessionId(sessionId)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertThrows(
                SessionTerminatedException.class,
                () -> sessionValidationService.validateSession(email, sessionId)
        );
    }

    @Test
    void shouldThrowWhenActiveIsNull() {
        User user = User.builder()
                .email(email)
                .active(null)
                .currentSessionId(sessionId)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertThrows(
                SessionTerminatedException.class,
                () -> sessionValidationService.validateSession(email, sessionId)
        );
    }

    @Test
    void shouldThrowWhenSessionIdMismatches() {
        User user = User.builder()
                .email(email)
                .active(true)
                .currentSessionId(UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"))
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertThrows(
                SessionTerminatedException.class,
                () -> sessionValidationService.validateSession(email, sessionId)
        );
    }

    @Test
    void shouldPassWhenActiveAndSessionIdMatches() {
        User user = User.builder()
                .email(email)
                .active(true)
                .currentSessionId(sessionId)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertDoesNotThrow(
                () -> sessionValidationService.validateSession(email, sessionId)
        );

        verify(userRepository).findByEmail(email);
    }
}
