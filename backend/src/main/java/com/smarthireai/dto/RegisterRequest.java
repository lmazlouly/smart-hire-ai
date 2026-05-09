package com.smarthireai.dto;

import com.smarthireai.entity.Role;

public record RegisterRequest(
        String fullName,
        String email,
        String password,
        Role role
) {
}
