
package com.example.whatsapp.service.impl;

import com.example.whatsapp.dto.whatsappdto.WhatsappConnectionDto;
import com.example.whatsapp.entity.WhatsappEntity;
import com.example.whatsapp.repository.WhatsappRepository;

import com.example.whatsapp.service.MetaWhatsappService;
import com.example.whatsapp.service.WhatsappService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WhatsappServiceImpl implements WhatsappService {

    private final WhatsappRepository whatsappRepository;
    private final MetaWhatsappService metaWhatsAppService;

    @Override
    @Transactional
    public WhatsappConnectionDto connectWhatsApp(
            Long userId,
            String authorizationCode,
            String wabaId,
            String phoneNumberId
    ) {

        if (authorizationCode == null || authorizationCode.isBlank()
                || wabaId == null || wabaId.isBlank()
                || phoneNumberId == null || phoneNumberId.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Authorization code, WABA ID and phone number ID are required."
            );
        }

        MetaWhatsappService.MetaTokenResponse tokenResponse =
                metaWhatsAppService.exchangeCode(authorizationCode);

        String accessToken = tokenResponse.accessToken();

        MetaWhatsappService.MetaPhoneNumbersResponse phoneResponse =
                metaWhatsAppService.getWabaPhoneNumbers(
                        wabaId,
                        accessToken
                );

        MetaWhatsappService.MetaPhoneNumber phone =
                phoneResponse.data()
                        .stream()
                        .filter(item ->
                                phoneNumberId.equals(item.id())
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Phone number does not belong to the selected WhatsApp Business Account."
                                )
                        );
        WhatsappEntity entity =
                whatsappRepository.findByPhoneNumberId(phoneNumberId)
                        .orElseGet(WhatsappEntity::new);

        if (entity.getId() != null &&
                !entity.getUserId().equals(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This WhatsApp phone number is already connected to another application user."
            );
        }

        metaWhatsAppService.subscribeAppToWaba(
                wabaId,
                accessToken
        );

        entity.setUserId(userId);
        entity.setWabaId(wabaId);
        entity.setPhoneNumberId(phoneNumberId);
        entity.setDisplayPhoneNumber(phone.displayPhoneNumber());
        entity.setVerifiedName(phone.verifiedName());
        entity.setAccessToken(accessToken);
        entity.setConnectionStatus(
                WhatsappEntity.ConnectionStatus.CONNECTED
        );
        entity.setIsActive(true);
        entity.setConnectedAt(LocalDateTime.now());

        WhatsappEntity saved = whatsappRepository.save(entity);

        return new WhatsappConnectionDto(
                "WhatsApp Business account connected successfully.",
                saved.getId(),
                saved.getWabaId(),
                saved.getPhoneNumberId(),
                saved.getDisplayPhoneNumber(),
                saved.getVerifiedName(),
                saved.getConnectionStatus().name()
        );
    }

    @Override
    public WhatsappConnectionDto getWhatsAppAccount(Long userId) {

        WhatsappEntity entity =
                whatsappRepository.findFirstByUserIdAndIsActiveTrue(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "WhatsApp account not found."
                                )
                        );

        return new WhatsappConnectionDto(
                "WhatsApp account found.",
                entity.getId(),
                entity.getWabaId(),
                entity.getPhoneNumberId(),
                entity.getDisplayPhoneNumber(),
                entity.getVerifiedName(),
                entity.getConnectionStatus().name()
        );
    }

    @Override
    @Transactional
    public void disconnectWhatsApp(Long userId) {

        WhatsappEntity entity =
                whatsappRepository.findFirstByUserIdAndIsActiveTrue(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "WhatsApp account not found."
                                )
                        );

        entity.setIsActive(false);
        entity.setConnectionStatus(
                WhatsappEntity.ConnectionStatus.DISCONNECTED
        );

        whatsappRepository.save(entity);
    }
}
