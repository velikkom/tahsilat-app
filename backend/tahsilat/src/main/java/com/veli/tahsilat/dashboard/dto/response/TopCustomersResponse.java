package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TopCustomersResponse {

    private List<TopCustomerItemResponse> customers;
}
