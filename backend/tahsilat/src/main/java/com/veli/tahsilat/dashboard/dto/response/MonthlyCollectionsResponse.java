package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MonthlyCollectionsResponse {

    private Integer year;

    private List<MonthlyCollectionItemResponse> months;
}
