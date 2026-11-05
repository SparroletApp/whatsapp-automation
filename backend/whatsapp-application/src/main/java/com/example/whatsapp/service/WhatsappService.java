
package com.example.whatsapp.service;

import com.example.whatsapp.dto.whatsappdto.WhatsappConnectionDto;

public interface WhatsappService {

    WhatsappConnectionDto connectWhatsApp(
            Long userId,
            String authorizationCode,
            String wabaId,
            String phoneNumberId
    );

    WhatsappConnectionDto getWhatsAppAccount(Long userId);

    void disconnectWhatsApp(Long userId);
}
