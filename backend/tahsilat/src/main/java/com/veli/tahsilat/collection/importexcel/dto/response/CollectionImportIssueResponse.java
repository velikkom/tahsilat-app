package com.veli.tahsilat.collection.importexcel.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CollectionImportIssueResponse {

    private int rowNumber;

    private String customerName;

    private String issueType;

    private String message;
}
