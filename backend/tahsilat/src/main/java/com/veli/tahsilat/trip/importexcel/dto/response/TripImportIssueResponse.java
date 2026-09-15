package com.veli.tahsilat.trip.importexcel.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TripImportIssueResponse {

    private Integer rowNumber;

    private String customerName;

    private String issueType;

    private String message;
}
