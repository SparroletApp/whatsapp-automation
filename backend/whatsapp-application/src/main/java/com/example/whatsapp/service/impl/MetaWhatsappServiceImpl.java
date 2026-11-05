package com.example.whatsapp.service.impl;

import com.example.whatsapp.config.MetaConfig;
import com.example.whatsapp.service.MetaWhatsappService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class MetaWhatsappServiceImpl implements MetaWhatsappService {

    private final MetaConfig metaConfig;

    private final RestClient restClient = RestClient.create();

    private String graphUrl() {
        return "https://graph.facebook.com/"
                + metaConfig.getGraphVersion();
    }

    @Override
    public String exchangeCode(String authorizationCode) {

        JsonNode response = restClient.get()
                .uri(UriComponentsBuilder
                        .fromUriString(graphUrl() + "/oauth/access_token")
                        .queryParam("client_id", metaConfig.getAppId())
                        .queryParam("client_secret", metaConfig.getAppSecret())
                        .queryParam("code", authorizationCode)
                        .build()
                        .encode()
                        .toUri())
                .retrieve()
                .body(JsonNode.class);

        if (response == null ||
                response.path("access_token").isMissingNode()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Meta did not return an access token."
            );
        }

        return response.path("access_token").asText();
    }

    @Override
    public JsonNode debugToken(String accessToken) {

        String appAccessToken =
                metaConfig.getAppId()
                        + "|"
                        + metaConfig.getAppSecret();

        return restClient.get()
                .uri(UriComponentsBuilder
                        .fromUriString(graphUrl() + "/debug_token")
                        .queryParam("input_token", accessToken)
                        .queryParam("access_token", appAccessToken)
                        .build()
                        .encode()
                        .toUri())
                .retrieve()
                .body(JsonNode.class);
    }

    @Override
    public JsonNode getPhoneNumbers(
            String wabaId,
            String accessToken) {

        return restClient.get()
                .uri(UriComponentsBuilder
                        .fromUriString(
                                graphUrl() + "/" + wabaId + "/phone_numbers")
                        .queryParam(
                                "fields",
                                "id,display_phone_number,verified_name")
                        .queryParam("access_token", accessToken)
                        .build()
                        .encode()
                        .toUri())
                .retrieve()
                .body(JsonNode.class);
    }

    @Override
    public void subscribeAppToWaba(
            String wabaId,
            String accessToken) {

        restClient.post()
                .uri(UriComponentsBuilder
                        .fromUriString(
                                graphUrl() + "/" + wabaId + "/subscribed_apps")
                        .queryParam("access_token", accessToken)
                        .build()
                        .encode()
                        .toUri())
                .retrieve()
                .body(JsonNode.class);
    }
}