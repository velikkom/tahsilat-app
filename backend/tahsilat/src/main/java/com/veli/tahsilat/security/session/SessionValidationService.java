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
            log.warn(
                    "Session validation failed: missing jwtSessionId for user={}",
                    email
            );
            throw new SessionTerminatedException();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn(
                            "Session validation failed: user not found email={}",
                            email
                    );
                    return new SessionTerminatedException();
                });

        UUID dbSessionId = user.getCurrentSessionId();

        log.debug(
                "Session validation user={} jwtSessionId={} dbSessionId={}",
                email,
                jwtSessionId,
                dbSessionId
        );

        if (!Objects.equals(jwtSessionId, dbSessionId)) {
            log.warn(
                    "Session validation mismatch user={} jwtSessionId={} dbSessionId={}",
                    email,
                    jwtSessionId,
                    dbSessionId
            );
            throw new SessionTerminatedException();
        }

        log.debug("Session validation passed user={}", email);
    }
}
