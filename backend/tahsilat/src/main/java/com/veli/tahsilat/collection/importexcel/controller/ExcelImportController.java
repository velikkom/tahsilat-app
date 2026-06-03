package com.veli.tahsilat.collection.importexcel.controller;

import com.veli.tahsilat.collection.importexcel.dto.response.CollectionImportResultResponse;
import com.veli.tahsilat.collection.importexcel.service.ExcelImportService;
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
@RequestMapping("/api/v1/collections/import")
@RequiredArgsConstructor
public class ExcelImportController {

    private final ExcelImportService excelImportService;

    @Operation(summary = "Analyze Excel import without saving")
    @PostMapping(
            value = "/dry-run",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<CollectionImportResultResponse> dryRun(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(excelImportService.dryRun(file));
    }

    @Operation(summary = "Import collections from Excel")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<CollectionImportResultResponse> importCollections(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(excelImportService.importCollections(file));
    }
}
