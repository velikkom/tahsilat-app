package com.veli.tahsilat.trip.importexcel.support;

import com.veli.tahsilat.common.exception.BusinessException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;

/**
 * Same hardening rules as CollectionExcelParser (SV-11): max size, .xlsx
 * extension, and a zip ("PK") magic-byte check before handing the stream
 * to POI. Kept as its own small component in this package so the two new
 * trip sheet parsers share it without reaching into collection.importexcel.
 */
@Component
public class XlsxFileValidator {

    private static final long MAX_FILE_SIZE_BYTES = 2L * 1024 * 1024;
    private static final byte[] XLSX_MAGIC_BYTES = {0x50, 0x4B};

    public void validate(MultipartFile file, String fieldLabel) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(fieldLabel + " dosyası seçilmedi.");
        }

        String filename = file.getOriginalFilename();

        if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
            throw new BusinessException(fieldLabel + " için yalnızca .xlsx dosyaları desteklenir.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessException(fieldLabel + " dosyası çok büyük. Maksimum 2MB desteklenir.");
        }

        if (!hasXlsxSignature(file)) {
            throw new BusinessException(fieldLabel + " dosyasının içeriği geçerli bir Excel (.xlsx) dosyası değil.");
        }
    }

    private boolean hasXlsxSignature(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = inputStream.readNBytes(XLSX_MAGIC_BYTES.length);
            return Arrays.equals(header, XLSX_MAGIC_BYTES);
        } catch (IOException exception) {
            return false;
        }
    }
}
