
package com.example.whatsapp.service.impl;

import com.example.whatsapp.dto.whatsappdto.WhatsappConnectionDto;
import com.example.whatsapp.entity.WhatsappEntity;
import com.example.whatsapp.repository.WhatsappRepository;
import com.example.whatsapp.service.MetaWhatsappService;
import com.example.whatsapp.service.WhatsappService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Iterator;

@Service
@RequiredArgsConstructor
public class WhatsappServiceImpl implements WhatsappService {

    private final WhatsappRepository whatsappRepository;
    private final MetaWhatsappService metaWhatsappService;

    @Override
    @Transactional
    public WhatsappConnectionDto connectWhatsApp(
            Long userId,
            String authorizationCode,
            String wabaId,
            String phoneNumberId
    ) {

        if (userId == null || userId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid user ID."
            );
        }

        if (isBlank(authorizationCode)
                || isBlank(wabaId)
                || isBlank(phoneNumberId)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Authorization code, WABA ID and phone number ID are required."
            );
        }

        // 1. Exchange the authorization code for the Meta access token.
        String accessToken =
                metaWhatsappService.exchangeCode(authorizationCode);

        // 2. Validate the access token.
        JsonNode debugResponse =
                metaWhatsappService.debugToken(accessToken);

        JsonNode tokenData = debugResponse == null
                ? null
                : debugResponse.path("data");

        if (tokenData == null
                || !tokenData.path("is_valid").asBoolean(false)) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "The Meta access token is invalid or expired."
            );
        }

        String metaUserId = tokenData.path("user_id").asText(null);

        if (!hasPermission(tokenData, "whatsapp_business_management")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "WhatsApp Business Management permission was not granted."
            );
        }

        JsonNode phoneResponse =
                metaWhatsappService.getPhoneNumbers(wabaId, accessToken);

        JsonNode phoneList = phoneResponse == null
                ? null
                : phoneResponse.path("data");

        if (phoneList == null || !phoneList.isArray()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Meta did not return the WABA phone numbers."
            );
        }

        String displayPhoneNumber = null;
        String verifiedName = null;
        boolean phoneFound = false;

        for (JsonNode phone : phoneList) {

            if (phoneNumberId.equals(phone.path("id").asText())) {

                phoneFound = true;
                displayPhoneNumber =
                        phone.path("display_phone_number").asText(null);
                verifiedName =
                        phone.path("verified_name").asText(null);

                break;
            }
        }

        if (!phoneFound) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The selected phone number does not belong to this WABA."
            );
        }

        WhatsappEntity entity = whatsappRepository
                .findByPhoneNumberId(phoneNumberId)
                .orElseGet(WhatsappEntity::new);

        if (entity.getId() != null
                && !entity.getUserId().equals(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This WhatsApp phone number is already connected to another user."
            );
        }

        metaWhatsappService.subscribeAppToWaba(wabaId, accessToken);

        for (WhatsappEntity oldAccount :
                whatsappRepository.findAllByUserIdAndIsActiveTrue(userId)) {

            if (oldAccount.getId() == null
                    || !oldAccount.getId().equals(entity.getId())) {

                oldAccount.setIsActive(false);
                oldAccount.setConnectionStatus(
                        WhatsappEntity.ConnectionStatus.DISCONNECTED
                );

                whatsappRepository.save(oldAccount);
            }
        }

        entity.setUserId(userId);
        entity.setWabaId(wabaId);
        entity.setPhoneNumberId(phoneNumberId);
        entity.setDisplayPhoneNumber(displayPhoneNumber);
        entity.setVerifiedName(verifiedName);
        entity.setAccessToken(accessToken);
        entity.setMetaUserId(metaUserId);

        entity.setConnectionStatus(
                WhatsappEntity.ConnectionStatus.CONNECTED
        );

        entity.setIsActive(true);
        entity.setConnectedAt(LocalDateTime.now());

        WhatsappEntity saved = whatsappRepository.save(entity);

        return WhatsappConnectionDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public WhatsappConnectionDto getWhatsAppAccount(Long userId) {

        WhatsappEntity entity = whatsappRepository
                .findFirstByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No active WhatsApp account is connected."
                ));

        return WhatsappConnectionDto.fromEntity(entity);
    }

    @Override
    @Transactional
    public void disconnectWhatsApp(Long userId) {

        WhatsappEntity entity = whatsappRepository
                .findFirstByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No active WhatsApp account found."
                ));

        entity.setIsActive(false);
        entity.setConnectionStatus(
                WhatsappEntity.ConnectionStatus.DISCONNECTED
        );

        whatsappRepository.save(entity);
    }

    private boolean hasPermission(JsonNode tokenData, String permission) {

        JsonNode scopes = tokenData.path("scopes");

        if (scopes.isArray()) {
            for (JsonNode scope : scopes) {
                if (permission.equals(scope.asText())) {
                    return true;
                }
            }
        }

        return false;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
