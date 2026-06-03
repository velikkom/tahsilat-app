package com.veli.tahsilat.collection.importexcel.support;

import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class CustomerNameNormalizer {

    public String normalizeCustomerName(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        String normalized = replaceTurkishCharacters(value.trim());
        normalized = normalized.toUpperCase(Locale.forLanguageTag("tr-TR"));
        normalized = replaceTurkishCharacters(normalized);
        normalized = normalized.replaceAll("[.,;:'\"()/\\\\]", " ");
        normalized = normalized.replace("-", " ");
        normalized = normalized.replace("–", " ");
        normalized = normalized.replace("—", " ");
        normalized = normalized.replaceAll("\\s+", " ").trim();

        return normalized;
    }

    private String replaceTurkishCharacters(String value) {
        return value
                .replace('ç', 'c')
                .replace('Ç', 'C')
                .replace('ğ', 'g')
                .replace('Ğ', 'G')
                .replace('ı', 'i')
                .replace('I', 'I')
                .replace('İ', 'I')
                .replace('i', 'i')
                .replace('ö', 'o')
                .replace('Ö', 'O')
                .replace('ş', 's')
                .replace('Ş', 'S')
                .replace('ü', 'u')
                .replace('Ü', 'U');
    }
}
