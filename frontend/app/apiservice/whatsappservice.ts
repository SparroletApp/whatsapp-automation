
import axios from "axios";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface WhatsappConnectRequest {
    authorizationCode: string;
    wabaId: string;
    phoneNumberId: string;
}

export interface WhatsappConnection {
    id: number;
    userId: number;
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    verifiedName: string;
    metaBusinessId?: string;
    metaUserId?: string;
    connectionStatus: string;
    isActive: boolean;
    connectedAt: string;
}

const whatsappService = {

    connectWhatsApp: async (
        request: WhatsappConnectRequest,
        userId: number
    ): Promise<WhatsappConnection> => {

        const response = await axios.post(
            `${API_BASE_URL}/api/whatsapp/connect`,
            request,
            {
                params: { userId }
            }
        );

        return response.data;
    },

    getWhatsAppAccount: async (
        userId: number
    ): Promise<WhatsappConnection> => {

        const response = await axios.get(
            `${API_BASE_URL}/api/whatsapp/account/${userId}`
        );

        return response.data;
    },

    disconnectWhatsApp: async (userId: number): Promise<string> => {

        const response = await axios.post(
            `${API_BASE_URL}/api/whatsapp/disconnect/${userId}`
        );

        return response.data.message;
    }
};

export default whatsappService;
