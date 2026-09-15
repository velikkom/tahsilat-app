package com.veli.tahsilat.trip.importexcel.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class TripImportResultResponse {

    private UUID tripId;

    private String salesmanName;

    private String vehiclePlate;

    private LocalDate startDate;

    private LocalDate endDate;

    private int dayCount;

    private int totalRows;

    private int validRows;

    private int importedRows;

    private int duplicateRows;

    private int invalidRows;

    private boolean hasOverlap;

    private List<TripImportIssueResponse> issues;
}
