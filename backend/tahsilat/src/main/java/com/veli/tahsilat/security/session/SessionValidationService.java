package com.veli.tahsilat.security.session;

import com.veli.tahsilat.common.exception.SessionTerminatedException;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionValidationService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public void validateSession(String email, UUID jwtSessionId) {
        if (jwtSessionId == null) {
            log.warn("Session validation failed: missing session claim");
            throw new SessionTerminatedException();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Session validation failed: user not found");
                    return new SessionTerminatedException();
                });

        if (!Boolean.TRUE.equals(user.getActive())) {
            log.warn("Session validation failed: account disabled");
            throw new SessionTerminatedException();
        }

        UUID dbSessionId = user.getCurrentSessionId();

        if (!Objects.equals(jwtSessionId, dbSessionId)) {
            log.warn("Session validation mismatch");
            throw new SessionTerminatedException();
        }
    }
}
