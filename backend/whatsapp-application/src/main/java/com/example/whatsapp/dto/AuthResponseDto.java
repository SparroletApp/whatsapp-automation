package com.example.whatsapp.dto;

import com.example.whatsapp.dto.userdto.UserResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponseDto {

    private boolean success;
    private String message;
    private String token;
    private UserResponseDto user;
}