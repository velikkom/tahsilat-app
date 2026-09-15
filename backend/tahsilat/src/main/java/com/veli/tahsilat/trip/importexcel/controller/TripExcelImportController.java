package com.veli.tahsilat.trip.importexcel.controller;

import com.veli.tahsilat.trip.importexcel.dto.response.TripImportResultResponse;
import com.veli.tahsilat.trip.importexcel.service.TripExcelImportService;

import io.swagger.v3.oas.annotations.Operation;

import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/trips/import")
@RequiredArgsConstructor
public class TripExcelImportController {

    private final TripExcelImportService tripExcelImportService;

    @Operation(summary = "Analyze a Form 1 + Form 2 weekly trip Excel pair without saving")
    @PostMapping(value = "/dry-run", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<TripImportResultResponse> dryRun(
            @RequestParam("collectionFile") MultipartFile collectionFile,
            @RequestParam("expenseFile") MultipartFile expenseFile
    ) {
        return ResponseEntity.ok(tripExcelImportService.dryRun(collectionFile, expenseFile));
    }

    @Operation(summary = "Import a trip (daily expenses + collections) from a Form 1 + Form 2 Excel pair")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<TripImportResultResponse> importTrip(
            @RequestParam("collectionFile") MultipartFile collectionFile,
            @RequestParam("expenseFile") MultipartFile expenseFile,
            @RequestParam(value = "confirmOverlap", defaultValue = "false") boolean confirmOverlap
    ) {
        return ResponseEntity.ok(
                tripExcelImportService.importTrip(collectionFile, expenseFile, confirmOverlap)
        );
    }
}
