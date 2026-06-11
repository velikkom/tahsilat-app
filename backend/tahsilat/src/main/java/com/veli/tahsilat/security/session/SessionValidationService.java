package com.veli.tahsilat.security.session;

import com.veli.tahsilat.common.exception.SessionTerminatedException;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionValidationService {

    private final UserRepository userRepository;

    public void validateSession(String email, UUID jwtSessionId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(SessionTerminatedException::new);

        UUID dbSessionId = user.getCurrentSessionId();

        if (!Objects.equals(jwtSessionId, dbSessionId)) {
            throw new SessionTerminatedException();
        }
    }
}
