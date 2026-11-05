
package com.example.whatsapp.service.impl;

import com.example.whatsapp.service.MetaWhatsappService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class MetaWhatsappServiceImpl implements MetaWhatsappService {

    private final RestClient.Builder restClientBuilder;

    @Value("${meta.whatsapp.app-id}")
    private String appId;

    @Value("${meta.whatsapp.app-secret}")
    private String appSecret;

    @Value("${meta.whatsapp.graph-version}")
    private String graphVersion;

    private RestClient client() {
        return restClientBuilder
                .baseUrl("https://graph.facebook.com/" + graphVersion)
                .build();
    }

    @Override
    public String exchangeCode(String code) {

        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();

            form.add("client_id", appId);
            form.add("client_secret", appSecret);
            form.add("code", code);

            JsonNode response = client()
                    .post()
                    .uri("/oauth/access_token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.hasNonNull("access_token")) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Meta did not return an access token."
                );
            }

            return response.get("access_token").asText();

        } catch (RestClientResponseException ex) {
            throw metaError("Authorization code exchange failed", ex);
        }
    }

    @Override
    public JsonNode debugToken(String accessToken) {

        try {
            String appAccessToken = appId + "|" + appSecret;

            return client()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/debug_token")
                            .queryParam("input_token", accessToken)
                            .queryParam("access_token", appAccessToken)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

        } catch (RestClientResponseException ex) {
            throw metaError("Could not validate the Meta access token", ex);
        }
    }

    @Override
    public JsonNode getPhoneNumbers(String wabaId, String accessToken) {

        try {
            return client()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/{wabaId}/phone_numbers")
                            .queryParam(
                                    "fields",
                                    "id,display_phone_number,verified_name"
                            )
                            .build(wabaId))
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(JsonNode.class);

        } catch (RestClientResponseException ex) {
            throw metaError("Could not retrieve WABA phone numbers", ex);
        }
    }

    @Override
    public JsonNode subscribeAppToWaba(
            String wabaId,
            String accessToken
    ) {

        try {
            return client()
                    .post()
                    .uri("/{wabaId}/subscribed_apps", wabaId)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(JsonNode.class);

        } catch (RestClientResponseException ex) {
            throw metaError("Could not subscribe the app to the WABA", ex);
        }
    }

    private ResponseStatusException metaError(
            String message,
            RestClientResponseException ex
    ) {
        return new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                message + ". Meta response: " + ex.getResponseBodyAsString()
        );
    }
}
