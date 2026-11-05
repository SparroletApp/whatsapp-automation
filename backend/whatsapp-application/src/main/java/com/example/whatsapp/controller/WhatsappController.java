
package com.example.whatsapp.controller;

import com.example.whatsapp.dto.WhatsappConnectRequestDto;
import com.example.whatsapp.dto.whatsappdto.WhatsappConnectionDto;
import com.example.whatsapp.service.WhatsappService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
public class WhatsappController {

    private final WhatsappService whatsappService;

    @PostMapping("/connect")
    public ResponseEntity<WhatsappConnectionDto> connectWhatsApp(
            @RequestParam Long userId,
            @Valid @RequestBody WhatsappConnectRequestDto request
    ) {

        WhatsappConnectionDto response =
                whatsappService.connectWhatsApp(
                        userId,
                        request.getAuthorizationCode(),
                        request.getWabaId(),
                        request.getPhoneNumberId()
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/account/{userId}")
    public ResponseEntity<WhatsappConnectionDto> getWhatsAppAccount(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                whatsappService.getWhatsAppAccount(userId)
        );
    }

    @PostMapping("/disconnect/{userId}")
    public ResponseEntity<Map<String, String>> disconnectWhatsApp(
            @PathVariable Long userId
    ) {

        whatsappService.disconnectWhatsApp(userId);

        return ResponseEntity.ok(
                Map.of("message", "WhatsApp account disconnected successfully.")
        );
    }
}
