package com.veli.tahsilat.collection.importexcel.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CollectionImportResultResponse {

    private int totalRows;

    private int validRows;

    private int importedRows;

    private int duplicateRows;

    private int invalidRows;

    private List<CollectionImportIssueResponse> issues;
}
