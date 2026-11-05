package com.example.whatsapp.dto.whatsappdto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WhatsappConnectionDto {

    private String message;
    private Long id;
    private String wabaId;
    private String phoneNumberId;
    private String displayPhoneNumber;
    private String verifiedName;
    private String connectionStatus;
}