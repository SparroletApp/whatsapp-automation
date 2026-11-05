package com.example.whatsapp.dto.whatsappdto;

import com.example.whatsapp.entity.WhatsappEntity;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WhatsappConnectionDto {

    private Long id;

    private Long userId;

    private String wabaId;

    private String phoneNumberId;

    private String displayPhoneNumber;

    private String verifiedName;

    private String metaUserId;

    private String connectionStatus;

    private Boolean isActive;

    private LocalDateTime connectedAt;

    public static WhatsappConnectionDto fromEntity(
            WhatsappEntity entity) {

        WhatsappConnectionDto dto = new WhatsappConnectionDto();

        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());

        dto.setWabaId(entity.getWabaId());
        dto.setPhoneNumberId(entity.getPhoneNumberId());

        dto.setDisplayPhoneNumber(
                entity.getDisplayPhoneNumber());

        dto.setVerifiedName(entity.getVerifiedName());

        dto.setMetaUserId(entity.getMetaUserId());

        dto.setConnectionStatus(
                entity.getConnectionStatus().name());

        dto.setIsActive(entity.getIsActive());

        dto.setConnectedAt(entity.getConnectedAt());

        return dto;
    }
}