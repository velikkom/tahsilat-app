package com.veli.tahsilat.trip.importexcel.service;

import com.veli.tahsilat.trip.importexcel.dto.response.TripImportResultResponse;

import org.springframework.web.multipart.MultipartFile;

public interface TripExcelImportService {

    TripImportResultResponse dryRun(MultipartFile collectionFile, MultipartFile expenseFile);

    TripImportResultResponse importTrip(
            MultipartFile collectionFile,
            MultipartFile expenseFile,
            boolean confirmOverlap
    );
}
