
package com.example.whatsapp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WhatsappConnectRequestDto {

    @NotBlank
    private String authorizationCode;

    @NotBlank
    private String wabaId;

    @NotBlank
    private String phoneNumberId;
}
