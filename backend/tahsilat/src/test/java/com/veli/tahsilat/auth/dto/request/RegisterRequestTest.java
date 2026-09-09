package com.veli.tahsilat.auth.dto.request;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RegisterRequestTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        validatorFactory.close();
    }

    private RegisterRequest requestWithPassword(String password) {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Test");
        request.setLastName("User");
        request.setEmail("test@example.com");
        request.setPassword(password);
        return request;
    }

    @Test
    void singleCharacterPasswordIsRejected() {
        Set<ConstraintViolation<RegisterRequest>> violations =
                validator.validate(requestWithPassword("a"));

        assertFalse(violations.isEmpty(), "password 'a' must fail validation");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Pass1ab",       // 7 chars, letter+digit but too short
            "onlyletters",   // long enough but no digit
            "12345678",      // long enough but no letter
    })
    void tooShortOrMissingCharacterClassPasswordsAreRejected(String password) {
        Set<ConstraintViolation<RegisterRequest>> violations =
                validator.validate(requestWithPassword(password));

        assertFalse(violations.isEmpty(), "password '" + password + "' must fail validation");
    }

    @ParameterizedTest
    @ValueSource(strings = {"Passw0rd", "abcdefg1", "12345678a"})
    void validPasswordsWithLetterAndDigitAndMinLengthPassValidation(String password) {
        Set<ConstraintViolation<RegisterRequest>> violations =
                validator.validate(requestWithPassword(password));

        assertTrue(violations.isEmpty(), "password '" + password + "' should pass validation");
    }
}
