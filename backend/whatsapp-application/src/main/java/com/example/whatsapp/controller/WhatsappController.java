package com.example.whatsapp.controller;

import com.example.whatsapp.dto.whatsappdto.WhatsappConnectRequestDto;
import com.example.whatsapp.dto.whatsappdto.WhatsappConnectionDto;
import com.example.whatsapp.dto.whatsappdto.WhatsappUserRequestDto;
import com.example.whatsapp.service.WhatsappService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:3000",
        "https://whatsapp-automation-5vaf.onrender.com"
})
public class WhatsappController {

    private final WhatsappService whatsappService;

    @PostMapping("/connect")
    public ResponseEntity<WhatsappConnectionDto> connect(
            @RequestBody WhatsappConnectRequestDto request) {

        return ResponseEntity.ok(
                whatsappService.connectWhatsApp(request)
        );
    }

    @PostMapping("/account")
    public ResponseEntity<WhatsappConnectionDto> getAccount(
            @RequestBody WhatsappUserRequestDto request) {

        return ResponseEntity.ok(
                whatsappService.getWhatsAppAccount(
                        request.getUserId()
                )
        );
    }

    @PostMapping("/accounts")
    public ResponseEntity<List<WhatsappConnectionDto>> getAccounts(
            @RequestBody WhatsappUserRequestDto request) {

        return ResponseEntity.ok(
                whatsappService.getWhatsAppAccounts(
                        request.getUserId()
                )
        );
    }

    @PostMapping("/disconnect")
    public ResponseEntity<String> disconnect(
            @RequestBody WhatsappUserRequestDto request) {

        whatsappService.disconnectWhatsApp(
                request.getUserId()
        );

        return ResponseEntity.ok(
                "WhatsApp account disconnected successfully."
        );
    }
}