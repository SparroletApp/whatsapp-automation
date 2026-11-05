package com.example.whatsapp.repository;

import com.example.whatsapp.entity.WhatsappEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WhatsappRepository
        extends JpaRepository<WhatsappEntity, Long> {

    Optional<WhatsappEntity> findByPhoneNumberId(
            String phoneNumberId
    );

    Optional<WhatsappEntity> findByWabaId(String wabaId);

    Optional<WhatsappEntity> findFirstByUserIdAndIsActiveTrue(
            Long userId
    );
}