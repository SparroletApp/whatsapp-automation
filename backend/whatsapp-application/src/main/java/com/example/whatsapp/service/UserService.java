package com.example.whatsapp.service;

import com.example.whatsapp.dto.AuthResponseDto;
import com.example.whatsapp.dto.userdto.CreateUserDto;
import com.example.whatsapp.dto.userdto.LoginUserDto;

public interface UserService {
    AuthResponseDto createUser(CreateUserDto request);
    AuthResponseDto login(LoginUserDto request);

}