package com.veli.tahsilat.user.service;

import com.veli.tahsilat.user.dto.response.PendingUsersCountResponse;
import com.veli.tahsilat.user.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponse getCurrentUser();

    List<UserResponse> getPendingUsers();

    List<UserResponse> getAllUsers();

    PendingUsersCountResponse getPendingUsersCount();

    UserResponse activateUser(UUID userId);

    UserResponse deactivateUser(UUID userId);
}
