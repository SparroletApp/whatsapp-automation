
import apiService from "./apiservice";

export interface WhatsAppConnectRequest {
    authorizationCode: string;
    wabaId: string;
    phoneNumberId: string;
}

export interface WhatsAppResponse {
    message: string;
    account?: {
        id: number;
        wabaId: string;
        phoneNumberId: string;
        displayPhoneNumber?: string;
        verifiedName?: string;
        connectionStatus: string;
    };
}

const whatsappService = {
    connectWhatsApp: async (
        data: WhatsAppConnectRequest,
        userId: number
    ): Promise<WhatsAppResponse> => {
        const response = await apiService.post(
            "/api/whatsapp/connect",
            data,
            {
                params: { userId }
            }
        );

        return response.data;
    },

    getWhatsAppAccount: async (
        userId: number
    ): Promise<WhatsAppResponse> => {
        const response = await apiService.get(
            `/api/whatsapp/account/${userId}`
        );

        return response.data;
    },

    disconnectWhatsApp: async (
        userId: number
    ): Promise<WhatsAppResponse> => {
        const response = await apiService.post(
            `/api/whatsapp/disconnect/${userId}`
        );

        return response.data;
    }
};

export default whatsappService;
