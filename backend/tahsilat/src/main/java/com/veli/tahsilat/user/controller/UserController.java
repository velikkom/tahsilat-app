package com.veli.tahsilat.user.controller;

import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.user.dto.request.UpdateUserRoleRequest;
import com.veli.tahsilat.user.dto.response.PendingUsersCountResponse;
import com.veli.tahsilat.user.dto.response.RoleResponse;
import com.veli.tahsilat.user.dto.response.UserResponse;
import com.veli.tahsilat.user.enums.Role;
import com.veli.tahsilat.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<RoleResponse>> getRoles() {
        return ResponseEntity.ok(userService.getRoles());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserResponse>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    @GetMapping("/pending/count")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PendingUsersCountResponse> getPendingUsersCount() {
        return ResponseEntity.ok(userService.getPendingUsersCount());
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserResponse> activateUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        Role role = parseRole(request.getRole());
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    private Role parseRole(String roleValue) {
        try {
            return Role.valueOf(roleValue);
        } catch (IllegalArgumentException exception) {
            throw new BusinessException("Geçersiz rol: " + roleValue);
        }
    }
}
