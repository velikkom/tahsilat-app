package com.veli.tahsilat.user.dto.response;

import com.veli.tahsilat.user.enums.Role;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class UserResponse {

    private UUID id;

    private String firstName;

    private String lastName;

    private String email;

    private Role role;

    private Boolean active;

    private Boolean newUser;
}