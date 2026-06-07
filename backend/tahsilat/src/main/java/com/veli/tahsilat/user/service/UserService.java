package com.veli.tahsilat.user.service;

import com.veli.tahsilat.user.dto.response.PendingUsersCountResponse;
import com.veli.tahsilat.user.dto.response.RoleResponse;
import com.veli.tahsilat.user.dto.response.UserResponse;
import com.veli.tahsilat.user.enums.Role;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponse getCurrentUser();

    List<UserResponse> getPendingUsers();

    List<UserResponse> getAllUsers();

    List<RoleResponse> getRoles();

    PendingUsersCountResponse getPendingUsersCount();

    UserResponse activateUser(UUID userId);

    UserResponse deactivateUser(UUID userId);

    UserResponse updateUserRole(UUID userId, Role role);
}
