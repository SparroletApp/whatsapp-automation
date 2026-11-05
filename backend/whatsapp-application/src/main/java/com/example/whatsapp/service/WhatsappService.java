package com.example.whatsapp.service;

import com.example.whatsapp.dto.whatsappdto.WhatsappConnectRequestDto;
import com.example.whatsapp.dto.whatsappdto.WhatsappConnectionDto;
import com.example.whatsapp.dto.whatsappdto.WhatsappUserRequestDto;

import java.util.List;

public interface WhatsappService {

    WhatsappConnectionDto connectWhatsApp(
            WhatsappConnectRequestDto request);

    WhatsappConnectionDto getWhatsAppAccount(Long userId);

    List<WhatsappConnectionDto> getWhatsAppAccounts(Long userId);

    void disconnectWhatsApp(Long userId);
}