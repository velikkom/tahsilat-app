package com.veli.tahsilat.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RoleResponse {

    private String name;

    private String label;
}
