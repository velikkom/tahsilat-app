package com.veli.tahsilat.trip.importexcel.support;

import com.veli.tahsilat.collection.importexcel.support.CustomerNameNormalizer;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.repository.UserRepository;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SalesmanNameMatcherTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final SalesmanNameMatcher matcher =
            new SalesmanNameMatcher(userRepository, new CustomerNameNormalizer());

    @Test
    void matchesByNormalizedFullNameIgnoringCaseAndTurkishFolding() {
        User user = new User();
        user.setFirstName("Veli");
        user.setLastName("Kara");

        when(userRepository.findAllByOrderByEmailAsc()).thenReturn(List.of(user));

        Optional<User> result = matcher.match("VELİ KARA");

        assertTrue(result.isPresent());
        assertEquals(user, result.get());
    }

    @Test
    void noMatchWhenNoUserHasThatName() {
        User user = new User();
        user.setFirstName("Ayşe");
        user.setLastName("Yılmaz");

        when(userRepository.findAllByOrderByEmailAsc()).thenReturn(List.of(user));

        assertTrue(matcher.match("VELİ KARA").isEmpty());
    }

    @Test
    void blankNameNeverMatches() {
        assertTrue(matcher.match("").isEmpty());
        assertTrue(matcher.match(null).isEmpty());
    }
}
