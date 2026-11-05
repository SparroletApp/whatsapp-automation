
package com.example.whatsapp.dto.whatsappdto;

import com.example.whatsapp.entity.WhatsappEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class WhatsappConnectionDto {

    private Long id;
    private Long userId;
    private String wabaId;
    private String phoneNumberId;
    private String displayPhoneNumber;
    private String verifiedName;
    private String metaBusinessId;
    private String metaUserId;
    private String connectionStatus;
    private Boolean isActive;
    private LocalDateTime connectedAt;

    public static WhatsappConnectionDto fromEntity(WhatsappEntity entity) {
        return WhatsappConnectionDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .wabaId(entity.getWabaId())
                .phoneNumberId(entity.getPhoneNumberId())
                .displayPhoneNumber(entity.getDisplayPhoneNumber())
                .verifiedName(entity.getVerifiedName())
                .metaBusinessId(entity.getMetaBusinessId())
                .metaUserId(entity.getMetaUserId())
                .connectionStatus(
                        entity.getConnectionStatus() == null
                                ? null
                                : entity.getConnectionStatus().name()
                )
                .isActive(entity.getIsActive())
                .connectedAt(entity.getConnectedAt())
                .build();
    }
}
