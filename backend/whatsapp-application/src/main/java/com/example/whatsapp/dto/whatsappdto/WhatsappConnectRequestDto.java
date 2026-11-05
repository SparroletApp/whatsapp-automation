
package com.example.whatsapp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WhatsappConnectRequestDto {

    private String authorizationCode;

    private String wabaId;

    private String phoneNumberId;
}
