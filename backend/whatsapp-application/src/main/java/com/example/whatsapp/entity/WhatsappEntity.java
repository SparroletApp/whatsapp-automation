
package com.example.whatsapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "whatsapp_accounts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_whatsapp_phone_number_id",
                        columnNames = "phone_number_id"
                )
        }
)
@Getter
@Setter
public class WhatsappEntity extends BaseEntity {

    @Column(nullable = false)
    private Long userId;
    @Column(nullable = false)
    private String wabaId;
    @Column(nullable = false)
    private String phoneNumberId;
    private String displayPhoneNumber;
    private String verifiedName;
    @Column(nullable = false, length = 4096)
    private String accessToken;
    private String metaBusinessId;
    private String metaUserId;
    @Enumerated(EnumType.STRING)
    private ConnectionStatus connectionStatus;

    private Boolean isActive = true;

    private LocalDateTime connectedAt;

    public enum ConnectionStatus {
        PENDING,
        CONNECTED,
        DISCONNECTED,
        EXPIRED,
        FAILED
    }
}
