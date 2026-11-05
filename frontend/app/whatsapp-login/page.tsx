
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import whatsappService from "@/app/apiservice/whatsappservice";
import "./whatsapp-login.css";

interface LoggedInUser {
    id: number;
    name: string;
    email: string;
}

interface FacebookLoginResponse {
    status?: string;
    authResponse?: {
        code?: string;
    };
}

interface FacebookSDK {
    init: (config: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
    }) => void;

    login: (
        callback: (response: FacebookLoginResponse) => void,
        options: {
            config_id: string;
            response_type: "code";
            override_default_response_type: boolean;
        }
    ) => void;
}

interface SignupData {
    wabaId?: string;
    phoneNumberId?: string;
}

declare global {
    interface Window {
        FB?: FacebookSDK;
        fbAsyncInit?: () => void;
    }
}

function WhatsappLogin() {
    const [user, setUser] = useState<LoggedInUser | null>(null);
    const [sdkReady, setSdkReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const authorizationCodeRef = useRef("");
    const signupDataRef = useRef<SignupData>({});
    const connectingRef = useRef(false);

    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID;
    const graphVersion =
        process.env.NEXT_PUBLIC_META_GRAPH_VERSION;

    // Read logged-in user
    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setMessage("Unable to read user details.");
            }
        }
    }, []);

    // Send authorization details to Java backend
    const connectWhatsApp = useCallback(async () => {
        const code = authorizationCodeRef.current;
        const wabaId = signupDataRef.current.wabaId;
        const phoneNumberId = signupDataRef.current.phoneNumberId;

        if (!code || !wabaId || !phoneNumberId) {
            return;
        }

        if (connectingRef.current) {
            return;
        }

        connectingRef.current = true;
        setLoading(true);
        setMessage("Connecting your WhatsApp Business account...");

        try {
            const response = await whatsappService.connectWhatsApp(
                {
                    authorizationCode: code,
                    wabaId,
                    phoneNumberId
                },
                user!.id
            );

            setMessage(
                response.message ||
                "WhatsApp account connected successfully."
            );

            authorizationCodeRef.current = "";
            signupDataRef.current = {};

        } catch (error) {
            console.error("WhatsApp connection failed:", error);

            setMessage(
                "Unable to connect your WhatsApp account. Please try again."
            );
        } finally {
            connectingRef.current = false;
            setLoading(false);
        }
    }, [user]);

    // Load Facebook SDK and listen for signup events
    useEffect(() => {
        if (!appId || !configId || !graphVersion) {
            setMessage(
                "Meta App ID, Configuration ID or Graph API version is missing."
            );
            return;
        }

        const handleSignupMessage = (event: MessageEvent) => {
            let hostname: string;

            try {
                hostname = new URL(event.origin).hostname;
            } catch {
                return;
            }

            if (
                hostname !== "facebook.com" &&
                !hostname.endsWith(".facebook.com")
            ) {
                return;
            }

            let data: any;

            try {
                data =
                    typeof event.data === "string"
                        ? JSON.parse(event.data)
                        : event.data;
            } catch {
                return;
            }

            if (data?.type !== "WA_EMBEDDED_SIGNUP") {
                return;
            }

            if (data.event === "FINISH") {
                signupDataRef.current = {
                    wabaId: data.data?.waba_id,
                    phoneNumberId: data.data?.phone_number_id
                };

                connectWhatsApp();

            } else if (data.event === "CANCEL") {
                setLoading(false);

                setMessage(
                    "WhatsApp signup was cancelled."
                );

            } else if (data.event === "ERROR") {
                setLoading(false);

                setMessage(
                    data.data?.error_message ||
                    "An error occurred during WhatsApp signup."
                );
            }
        };

        window.addEventListener("message", handleSignupMessage);

        const initializeFacebook = () => {
            if (!window.FB) return;

            window.FB.init({
                appId,
                cookie: true,
                xfbml: false,
                version: graphVersion
            });

            setSdkReady(true);
        };

        if (window.FB) {
            initializeFacebook();
        } else {
            window.fbAsyncInit = initializeFacebook;

            if (!document.getElementById("facebook-jssdk")) {
                const script = document.createElement("script");

                script.id = "facebook-jssdk";
                script.src =
                    "https://connect.facebook.net/en_US/sdk.js";

                script.async = true;
                script.defer = true;

                document.body.appendChild(script);
            }
        }

        return () => {
            window.removeEventListener(
                "message",
                handleSignupMessage
            );
        };
    }, [appId, configId, graphVersion, connectWhatsApp]);

    // Open Facebook Embedded Signup
    const handleFacebookLogin = () => {
        if (!user) {
            setMessage("Please login first.");
            return;
        }

        if (!window.FB || !sdkReady) {
            setMessage("Facebook SDK is still loading.");
            return;
        }

        authorizationCodeRef.current = "";
        signupDataRef.current = {};
        connectingRef.current = false;

        setMessage("");
        setLoading(true);

        window.FB.login(
            (response: FacebookLoginResponse) => {
                const code = response.authResponse?.code;

                if (!code) {
                    setLoading(false);

                    setMessage(
                        "Facebook authorization was cancelled or failed."
                    );

                    return;
                }

                authorizationCodeRef.current = code;

                // Wait for the Embedded Signup FINISH event
                // to receive WABA ID and Phone Number ID.
                connectWhatsApp();
            },
            {
                config_id: configId!,
                response_type: "code",
                override_default_response_type: true
            }
        );
    };

    return (
        <section className="whatsapp-login">

            <div className="whatsapp-login-card">

                <div className="whatsapp-login-icon">
                    <i className="bi bi-whatsapp"></i>
                </div>

                <span className="whatsapp-login-label">
                    WHATSAPP BUSINESS INTEGRATION
                </span>

                <h1>
                    Connect Your WhatsApp Business
                </h1>

                <p className="whatsapp-login-description">
                    Connect your existing WhatsApp Business account
                    and manage customer conversations directly
                    from your application.
                </p>

                {user && (
                    <div className="whatsapp-login-user">

                        <div className="whatsapp-user-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                        </div>

                    </div>
                )}

                <button
                    type="button"
                    className="facebook-login-btn"
                    onClick={handleFacebookLogin}
                    disabled={!sdkReady || loading || !user}
                >
                    <i className="bi bi-facebook"></i>

                    {loading
                        ? "Connecting..."
                        : "Continue with Facebook"}
                </button>

                {message && (
                    <p className="whatsapp-login-message">
                        {message}
                    </p>
                )}

                <div className="whatsapp-login-security">
                    <i className="bi bi-shield-check"></i>
                    Secure connection powered by Meta
                </div>

            </div>

        </section>
    );
}

export default WhatsappLogin;
