
package com.example.whatsapp.service;

import com.fasterxml.jackson.databind.JsonNode;

public interface MetaWhatsappService {

    String exchangeCode(String code);

    JsonNode debugToken(String accessToken);

    JsonNode getPhoneNumbers(String wabaId, String accessToken);

    JsonNode subscribeAppToWaba(String wabaId, String accessToken);
}
