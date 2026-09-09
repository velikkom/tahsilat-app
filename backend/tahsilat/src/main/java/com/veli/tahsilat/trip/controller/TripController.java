package com.veli.tahsilat.trip.controller;

import com.veli.tahsilat.trip.dto.request.TripRequest;
import com.veli.tahsilat.trip.dto.response.TripResponse;
import com.veli.tahsilat.trip.service.TripService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
public class TripController {

    private static final MediaType XLSX_MEDIA_TYPE = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    private final TripService tripService;

    @Operation(summary = "Create trip")
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.createTrip(request));
    }

    @Operation(summary = "Get all trips")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<Page<TripResponse>> getAllTrips(Pageable pageable) {
        return ResponseEntity.ok(tripService.getAllTrips(pageable));
    }

    @Operation(summary = "Get trip by id")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<TripResponse> getTripById(@PathVariable UUID id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @Operation(summary = "Update trip by id")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<TripResponse> updateTrip(
            @PathVariable UUID id,
            @Valid @RequestBody TripRequest request
    ) {
        return ResponseEntity.ok(tripService.updateTrip(id, request));
    }

    @Operation(summary = "Delete trip by id")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<Void> deleteTrip(@PathVariable UUID id) {
        tripService.deleteTrip(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Download Form 2 expense document as xlsx")
    @GetMapping("/{id}/expense-document.xlsx")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<byte[]> downloadExpenseDocument(@PathVariable UUID id) {
        byte[] document = tripService.generateExpenseDocument(id);

        return ResponseEntity.ok()
                .contentType(XLSX_MEDIA_TYPE)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"harcama-dokumani-" + id + ".xlsx\""
                )
                .body(document);
    }

    @Operation(summary = "Download Form 1 collection statement as xlsx")
    @GetMapping("/{id}/collection-document.xlsx")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<byte[]> downloadCollectionDocument(@PathVariable UUID id) {
        byte[] document = tripService.generateCollectionDocument(id);

        return ResponseEntity.ok()
                .contentType(XLSX_MEDIA_TYPE)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"tahsilat-dokumu-" + id + ".xlsx\""
                )
                .body(document);
    }
}
