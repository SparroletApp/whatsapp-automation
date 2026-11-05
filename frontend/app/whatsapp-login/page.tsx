
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";


import "./whatsapp-login.css";
import whatsappService, { WhatsappConnection } from "../apiservice/whatsappservice";

interface LoggedInUser {
    id: number;
    name?: string;
    email?: string;
}

interface SignupData {
    wabaId: string;
    phoneNumberId: string;
}

function WhatsappLogin() {

    const [user, setUser] = useState<LoggedInUser | null>(null);
    const [sdkReady, setSdkReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [account, setAccount] =
        useState<WhatsappConnection | null>(null);

    const [message, setMessage] = useState(
        "Connect your WhatsApp Business account."
    );

    const authorizationCodeRef = useRef<string | null>(null);
    const signupDataRef = useRef<SignupData | null>(null);
    const connectingRef = useRef(false);

    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID;
    const graphVersion =
        process.env.NEXT_PUBLIC_META_GRAPH_VERSION || "vXX.X";

    useEffect(() => {

        const storedUser = sessionStorage.getItem("user");

        if (!storedUser) {
            setMessage("Please log in before connecting WhatsApp.");
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            if (!parsedUser.id) {
                setMessage("Invalid logged-in user.");
                return;
            }

            setUser(parsedUser);
        } catch {
            setMessage("Could not read your login information.");
        }

    }, []);

    const loadAccount = useCallback(async (userId: number) => {

        try {
            const response =
                await whatsappService.getWhatsAppAccount(userId);

            setAccount(response);
            setMessage("Your WhatsApp account is connected.");

        } catch {
            setAccount(null);
            setMessage("No WhatsApp account is currently connected.");
        }

    }, []);

    useEffect(() => {

        if (!user?.id) return;

        loadAccount(user.id);

    }, [user, loadAccount]);

    const connectWhatsApp = useCallback(async () => {

        const code = authorizationCodeRef.current;
        const signupData = signupDataRef.current;

        if (!code || !signupData || !user?.id) {
            return;
        }

        if (connectingRef.current) {
            return;
        }

        connectingRef.current = true;
        setLoading(true);
        setMessage("Connecting your WhatsApp account...");

        try {

            const response = await whatsappService.connectWhatsApp(
                {
                    authorizationCode: code,
                    wabaId: signupData.wabaId,
                    phoneNumberId: signupData.phoneNumberId
                },
                user.id
            );

            setAccount(response);

            authorizationCodeRef.current = null;
            signupDataRef.current = null;

            setMessage("WhatsApp connected successfully.");

            await Swal.fire({
                icon: "success",
                title: "WhatsApp Connected!",
                text: "Your WhatsApp Business account is now connected.",
                confirmButtonColor: "#25D366"
            });

        } catch (error: any) {

            const errorMessage =
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                "Unable to connect your WhatsApp account.";

            setMessage(errorMessage);

            await Swal.fire({
                icon: "error",
                title: "Connection Failed",
                text: errorMessage,
                confirmButtonColor: "#25D366"
            });

        } finally {

            connectingRef.current = false;
            setLoading(false);
        }

    }, [user]);

    useEffect(() => {

        if (!appId || !configId) {
            setMessage("Meta App ID or Embedded Signup Config ID is missing.");
            return;
        }

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

            const existingScript = document.getElementById(
                "facebook-jssdk"
            );

            if (!existingScript) {

                const script = document.createElement("script");

                script.id = "facebook-jssdk";
                script.src = "https://connect.facebook.net/en_US/sdk.js";
                script.async = true;
                script.defer = true;
                script.crossOrigin = "anonymous";

                document.body.appendChild(script);
            }
        }

        const handleEmbeddedSignup = (event: MessageEvent) => {

            const hostname = new URL(event.origin).hostname;

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

                const wabaId = data.data?.waba_id;
                const phoneNumberId = data.data?.phone_number_id;

                if (!wabaId || !phoneNumberId) {
                    setLoading(false);
                    setMessage(
                        "Meta signup finished, but the WABA or phone number ID was missing."
                    );
                    return;
                }

                signupDataRef.current = {
                    wabaId: String(wabaId),
                    phoneNumberId: String(phoneNumberId)
                };

                setMessage(
                    "WhatsApp signup completed. Verifying your account..."
                );

                void connectWhatsApp();
            }

            if (
                data.event === "CANCEL" ||
                data.event === "ERROR"
            ) {

                authorizationCodeRef.current = null;
                signupDataRef.current = null;

                connectingRef.current = false;
                setLoading(false);

                setMessage(
                    data.event === "CANCEL"
                        ? "WhatsApp signup was cancelled."
                        : "An error occurred during WhatsApp signup."
                );
            }

            // If your configuration supports WhatsApp Business App
            // coexistence, handle FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING
            // according to the session data returned by your Meta config.
        };

        window.addEventListener("message", handleEmbeddedSignup);

        return () => {
            window.removeEventListener(
                "message",
                handleEmbeddedSignup
            );
        };

    }, [appId, configId, graphVersion, connectWhatsApp]);

    const startSignup = () => {

        if (!user?.id) {
            Swal.fire({
                icon: "warning",
                title: "Login Required",
                text: "Please log in before connecting WhatsApp."
            });
            return;
        }

        if (!sdkReady || !window.FB) {
            Swal.fire({
                icon: "warning",
                title: "Please Wait",
                text: "Facebook SDK is still loading."
            });
            return;
        }

        if (loading || connectingRef.current) return;

        authorizationCodeRef.current = null;
        signupDataRef.current = null;

        setLoading(true);
        setMessage("Opening Meta WhatsApp signup...");

        window.FB.login(
            (response) => {

                const code = response?.authResponse?.code;

                if (!code) {

                    setLoading(false);
                    setMessage("Facebook authorization was not completed.");

                    return;
                }

                authorizationCodeRef.current = code;

                setMessage(
                    "Authorization received. Waiting for WhatsApp account details..."
                );

                void connectWhatsApp();
            },
            {
                config_id: configId!,
                response_type: "code",
                override_default_response_type: true
            }
        );
    };

    const disconnectWhatsApp = async () => {

        if (!user?.id || loading) return;

        const confirmation = await Swal.fire({
            icon: "warning",
            title: "Disconnect WhatsApp?",
            text: "Your WhatsApp account will be disconnected from this platform.",
            showCancelButton: true,
            confirmButtonText: "Disconnect",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc3545"
        });

        if (!confirmation.isConfirmed) return;

        setLoading(true);

        try {

            await whatsappService.disconnectWhatsApp(user.id);

            setAccount(null);
            setMessage("WhatsApp account disconnected.");

            await Swal.fire({
                icon: "success",
                title: "Disconnected",
                text: "Your WhatsApp account has been disconnected."
            });

        } catch (error: any) {

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.detail ||
                    error?.response?.data?.message ||
                    "Unable to disconnect WhatsApp."
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="whatsapp-login">

            <div className="whatsapp-card">

                <div className="whatsapp-icon">
                    <i className="bi bi-whatsapp"></i>
                </div>

                <h2>WhatsApp Business Integration</h2>

                <p className="whatsapp-description">
                    Connect your WhatsApp Business account to manage
                    customer conversations from your platform.
                </p>

                {account ? (

                    <div className="whatsapp-connected">

                        <div className="connection-status">
                            <span className="status-dot"></span>
                            Connected
                        </div>

                        <div className="account-details">
                            <div>
                                <span>Business name</span>
                                <strong>
                                    {account.verifiedName || "WhatsApp Business"}
                                </strong>
                            </div>

                            <div>
                                <span>Phone number</span>
                                <strong>
                                    {account.displayPhoneNumber || "Not available"}
                                </strong>
                            </div>

                            <div>
                                <span>WABA ID</span>
                                <strong>{account.wabaId}</strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="whatsapp-disconnect-btn"
                            onClick={disconnectWhatsApp}
                            disabled={loading}
                        >
                            {loading ? "Please wait..." : "Disconnect Account"}
                        </button>

                        <p className="replace-note">
                            To connect a different number, disconnect this
                            account and start signup again.
                        </p>

                    </div>

                ) : (

                    <button
                        type="button"
                        className="whatsapp-connect-btn"
                        onClick={startSignup}
                        disabled={!sdkReady || !user || loading}
                    >
                        <i className="bi bi-facebook"></i>

                        {loading
                            ? "Connecting..."
                            : "Continue with Facebook"}
                    </button>
                )}

                <div className="whatsapp-message">
                    {message}
                </div>

                {!sdkReady && !account && (
                    <p className="sdk-loading">
                        Loading Meta signup...
                    </p>
                )}

                <div className="whatsapp-security">
                    <i className="bi bi-shield-check"></i>
                    Secure onboarding powered by Meta
                </div>

            </div>

        </section>
    );
}

export default WhatsappLogin;
