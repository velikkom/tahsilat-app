package com.veli.tahsilat.trip.importexcel.support;

import com.veli.tahsilat.collection.importexcel.support.CustomerNameNormalizer;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Matches the free-text "SATIŞ PERSONELİ" name from Form 2 against an
 * active User by normalized full name. Reuses CustomerNameNormalizer's
 * Turkish-folding normalization (same rules that already work for
 * customer-name matching) rather than duplicating it. No fallback
 * creation - an unmatched name is a blocking issue for the caller to
 * report, same policy as customer matching.
 */
@Component
@RequiredArgsConstructor
public class SalesmanNameMatcher {

    private final UserRepository userRepository;
    private final CustomerNameNormalizer nameNormalizer;

    public Optional<User> match(String rawName) {
        if (rawName == null || rawName.isBlank()) {
            return Optional.empty();
        }

        String normalizedTarget = nameNormalizer.normalizeForDuplicateCheck(rawName);

        if (normalizedTarget.isBlank()) {
            return Optional.empty();
        }

        List<User> users = userRepository.findAllByOrderByEmailAsc();

        for (User user : users) {
            String fullName = ((user.getFirstName() == null ? "" : user.getFirstName())
                    + " "
                    + (user.getLastName() == null ? "" : user.getLastName())).trim();

            if (normalizedTarget.equals(nameNormalizer.normalizeForDuplicateCheck(fullName))) {
                return Optional.of(user);
            }
        }

        return Optional.empty();
    }
}
