
export {};

declare global {

    interface Window {
        FB: {
            init: (options: {
                appId: string;
                cookie?: boolean;
                xfbml?: boolean;
                version: string;
            }) => void;

            login: (
                callback: (response: FacebookLoginResponse) => void,
                options: {
                    config_id: string;
                    response_type: string;
                    override_default_response_type: boolean;
                    auth_type?: string;
                    extras?: Record<string, unknown>;
                }
            ) => void;
        };

        fbAsyncInit: () => void;
    }

    interface FacebookLoginResponse {
        authResponse?: {
            code?: string;
            accessToken?: string;
            userID?: string;
        };
        status?: string;
    }
}
