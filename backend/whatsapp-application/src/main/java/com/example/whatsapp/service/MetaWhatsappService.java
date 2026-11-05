
package com.example.whatsapp.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;

@Service
public class MetaWhatsappService {

    private final RestClient restClient = RestClient.create();

    @Value("${meta.app-id}")
    private String appId;

    @Value("${meta.app-secret}")
    private String appSecret;

    @Value("${meta.graph-version}")
    private String graphVersion;

    public MetaTokenResponse exchangeCode(String code) {

        try {
            MetaTokenResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("graph.facebook.com")
                            .path("/{version}/oauth/access_token")
                            .queryParam("client_id", appId)
                            .queryParam("client_secret", appSecret)
                            .queryParam("code", code)
                            .build(graphVersion))
                    .retrieve()
                    .body(MetaTokenResponse.class);

            if (response == null ||
                    response.accessToken() == null ||
                    response.accessToken().isBlank()) {
                throw new ResponseStatusException(
                        BAD_GATEWAY,
                        "Meta did not return an access token."
                );
            }

            return response;

        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    BAD_GATEWAY,
                    "Unable to exchange authorization code with Meta."
            );
        }
    }

    public MetaPhoneNumbersResponse getWabaPhoneNumbers(
            String wabaId,
            String accessToken
    ) {
        try {
            MetaPhoneNumbersResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("graph.facebook.com")
                            .path("/{version}/{wabaId}/phone_numbers")
                            .queryParam(
                                    "fields",
                                    "id,display_phone_number,verified_name"
                            )
                            .build(graphVersion, wabaId))
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + accessToken
                    )
                    .retrieve()
                    .body(MetaPhoneNumbersResponse.class);

            if (response == null || response.data() == null) {
                throw new ResponseStatusException(
                        BAD_GATEWAY,
                        "Unable to retrieve WhatsApp phone numbers."
                );
            }

            return response;

        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    BAD_GATEWAY,
                    "Meta phone number verification failed."
            );
        }
    }

    public void subscribeAppToWaba(
            String wabaId,
            String accessToken
    ) {
        try {
            restClient.post()
                    .uri(
                            "https://graph.facebook.com/{version}/{wabaId}/subscribed_apps",
                            graphVersion,
                            wabaId
                    )
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + accessToken
                    )
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception exception) {
            throw new ResponseStatusException(
                    BAD_GATEWAY,
                    "Unable to subscribe the application to WhatsApp webhooks."
            );
        }
    }

    public record MetaTokenResponse(
            @JsonProperty("access_token")
            String accessToken,

            @JsonProperty("token_type")
            String tokenType,

            @JsonProperty("expires_in")
            Long expiresIn
    ) {}

    public record MetaPhoneNumber(
            String id,

            @JsonProperty("display_phone_number")
            String displayPhoneNumber,

            @JsonProperty("verified_name")
            String verifiedName
    ) {}

    public record MetaPhoneNumbersResponse(
            List<MetaPhoneNumber> data
    ) {}
}
