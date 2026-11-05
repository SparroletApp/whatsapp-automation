package com.example.whatsapp.dto.whatsappdto;

import lombok.Data;

@Data
public class WhatsappConnectRequestDto {

    private Long userId;

    private String authorizationCode;

    private String wabaId;

    private String phoneNumberId;
}