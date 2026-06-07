package com.veli.tahsilat.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PendingUsersCountResponse {

    private long count;
}
