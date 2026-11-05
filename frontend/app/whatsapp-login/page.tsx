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
    const [sdkError, setSdkError] = useState("");

    const authorizationCodeRef = useRef("");
    const signupDataRef = useRef<SignupData>({});
    const connectingRef = useRef(false);

    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID;
    const graphVersion = process.env.NEXT_PUBLIC_META_GRAPH_VERSION;

    // Load the logged-in user
    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");

        if (!storedUser) {
            setMessage("Please login to your application first.");
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            if (!parsedUser.id) {
                setMessage("Invalid user session. Please login again.");
                return;
            }

            setUser(parsedUser);
        } catch (error) {
            console.error("User session error:", error);
            setMessage("Unable to read user details. Please login again.");
        }
    }, []);

    // Connect WhatsApp account to Spring Boot backend
    const connectWhatsApp = useCallback(async () => {
        const code = authorizationCodeRef.current;
        const wabaId = signupDataRef.current.wabaId;
        const phoneNumberId = signupDataRef.current.phoneNumberId;

        if (!code || !wabaId || !phoneNumberId || !user) {
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
                user.id
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

    // Initialize Facebook SDK
    useEffect(() => {
        let cancelled = false;
        let initialized = false;

        if (!appId || !configId || !graphVersion) {
            const missing = [
                !appId && "META_APP_ID",
                !configId && "META_CONFIG_ID",
                !graphVersion && "META_GRAPH_VERSION"
            ].filter(Boolean);

            setSdkError(
                `Missing Meta environment variables: ${missing.join(", ")}`
            );

            setSdkReady(false);
            return;
        }

        setSdkError("");

        const initializeFacebook = () => {
            if (cancelled || initialized) return;

            if (!window.FB) {
                setSdkError("Facebook SDK has not loaded. Please refresh.");
                return;
            }

            try {
                window.FB.init({
                    appId,
                    cookie: true,
                    xfbml: false,
                    version: graphVersion
                });

                initialized = true;
                setSdkReady(true);
                setSdkError("");
                console.log("Facebook SDK initialized successfully.");

            } catch (error) {
                console.error("Facebook SDK initialization failed:", error);
                setSdkError("Unable to initialize Facebook SDK.");
                setSdkReady(false);
            }
        };

        const handleScriptError = () => {
            if (cancelled) return;

            setSdkReady(false);
            setSdkError(
                "Unable to load Facebook SDK. Check your internet connection or Meta SDK settings."
            );
        };

        // Embedded Signup event listener
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

            console.log("WhatsApp Embedded Signup event:", data);

            if (data.event === "FINISH") {
                signupDataRef.current = {
                    wabaId: data.data?.waba_id,
                    phoneNumberId: data.data?.phone_number_id
                };

                setMessage("WhatsApp signup completed. Saving account...");

                connectWhatsApp();

            } else if (data.event === "CANCEL") {
                setLoading(false);
                setMessage("WhatsApp signup was cancelled.");

            } else if (data.event === "ERROR") {
                setLoading(false);

                setMessage(
                    data.data?.error_message ||
                    "An error occurred during WhatsApp signup."
                );
            }
        };

        window.addEventListener("message", handleSignupMessage);

        // Facebook SDK callback
        window.fbAsyncInit = initializeFacebook;

        if (window.FB) {
            initializeFacebook();
        } else {
            let script = document.getElementById(
                "facebook-jssdk"
            ) as HTMLScriptElement | null;

            // Remove an existing failed script
            if (script?.dataset.sdkFailed === "true") {
                script.remove();
                script = null;
            }

            if (!script) {
                script = document.createElement("script");

                script.id = "facebook-jssdk";
                script.src =
                    "https://connect.facebook.net/en_US/sdk.js";

                script.async = true;
                script.defer = true;

                script.addEventListener("load", initializeFacebook);
                script.addEventListener("error", handleScriptError);

                document.head.appendChild(script);

            } else {
                script.addEventListener("load", initializeFacebook);
                script.addEventListener("error", handleScriptError);
            }
        }

        return () => {
            cancelled = true;

            window.removeEventListener(
                "message",
                handleSignupMessage
            );

            const script = document.getElementById(
                "facebook-jssdk"
            );

            script?.removeEventListener("load", initializeFacebook);
            script?.removeEventListener("error", handleScriptError);

            if (window.fbAsyncInit === initializeFacebook) {
                window.fbAsyncInit = undefined;
            }
        };

    }, [appId, configId, graphVersion, connectWhatsApp]);

    // Facebook Embedded Signup
    const handleFacebookLogin = () => {
        if (!user) {
            setMessage("Please login to your application first.");
            return;
        }

        if (!appId || !configId) {
            setMessage("Meta App ID or Configuration ID is missing.");
            return;
        }

        if (!window.FB || !sdkReady) {
            setMessage(
                "Facebook SDK is not ready. Please refresh the page."
            );
            return;
        }

        authorizationCodeRef.current = "";
        signupDataRef.current = {};
        connectingRef.current = false;

        setMessage("");
        setLoading(true);

        try {
            window.FB.login(
                (response: FacebookLoginResponse) => {
                    console.log("Facebook login response:", response);

                    const code = response.authResponse?.code;

                    if (!code) {
                        setLoading(false);

                        setMessage(
                            "Facebook authorization was cancelled or failed."
                        );

                        return;
                    }

                    authorizationCodeRef.current = code;

                    setMessage(
                        "Facebook authorization successful. Waiting for WhatsApp signup..."
                    );

                    // connectWhatsApp will proceed when both
                    // authorization code and signup IDs are available.
                    connectWhatsApp();
                },
                {
                    config_id: configId,
                    response_type: "code",
                    override_default_response_type: true
                }
            );

        } catch (error) {
            console.error("Facebook login error:", error);

            setLoading(false);
            setMessage("Unable to open Facebook Login.");
        }
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
                            {user.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                        </div>

                    </div>
                )}

                {sdkError && (
                    <p className="whatsapp-login-message">
                        {sdkError}
                    </p>
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
                        : !sdkReady
                            ? "Loading Facebook..."
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