package com.smarthireai.dto;

import com.smarthireai.entity.Role;

public record AuthResponse(
        String token,
        String type,
        String email,
        String fullName,
        Role role
) {
}
