package com.example.whatsapp.controller;

import com.example.whatsapp.dto.WhatsappConnectRequestDto;
import com.example.whatsapp.dto.whatsappdto.WhatsappConnectionDto;
import com.example.whatsapp.service.WhatsappService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
public class WhatsappController {

    private final WhatsappService whatsappService;

    @PostMapping("/connect")
    public WhatsappConnectionDto connectWhatsApp(
            @RequestParam Long userId,
            @RequestBody WhatsappConnectRequestDto request
    ) {
        return whatsappService.connectWhatsApp(
                userId,
                request.getAuthorizationCode(),
                request.getWabaId(),
                request.getPhoneNumberId()
        );
    }

    @GetMapping("/account/{userId}")
    public WhatsappConnectionDto getWhatsAppAccount(
            @PathVariable Long userId
    ) {
        return whatsappService.getWhatsAppAccount(userId);
    }

    @PostMapping("/disconnect/{userId}")
    public String disconnectWhatsApp(
            @PathVariable Long userId
    ) {
        whatsappService.disconnectWhatsApp(userId);

        return "WhatsApp account disconnected successfully.";
    }
}