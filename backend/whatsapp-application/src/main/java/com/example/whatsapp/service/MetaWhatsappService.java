package com.example.whatsapp.service;

import com.fasterxml.jackson.databind.JsonNode;

public interface MetaWhatsappService {

    String exchangeCode(String authorizationCode);

    JsonNode debugToken(String accessToken);

    JsonNode getPhoneNumbers(
            String wabaId,
            String accessToken);

    void subscribeAppToWaba(
            String wabaId,
            String accessToken);
}