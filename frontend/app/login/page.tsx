
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import userService from "@/app/apiservice/userservice";
import "./login.css";

function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            await Swal.fire({
                icon: "warning",
                title: "Required Fields",
                text: "Please enter your email and password.",
                confirmButtonColor: "#421DDB",
            });
            return;
        }

        try {
            setLoading(true);

            // Remove previous login details before attempting login.
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("user");

            const response = await userService.login({
                email: email.trim(),
                password,
            });

            // Validate the login response.
            if (!response?.token || !response?.user) {
                throw new Error("Invalid login response from server.");
            }

            // Save authentication details.
            sessionStorage.setItem("access_token", response.token);
            sessionStorage.setItem(
                "user",
                JSON.stringify(response.user)
            );

            await Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: `Welcome back, ${response.user.name}!`,
                confirmButtonColor: "#421DDB",
                timer: 1800,
                showConfirmButton: false,
            });

            router.replace("/whatsapp-login");

        } catch (error: any) {
            // Clear authentication data if login fails.
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("user");

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Invalid email or password. Please try again.",
                confirmButtonColor: "#421DDB",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-background-shape login-shape-one"></div>
            <div className="login-background-shape login-shape-two"></div>

            <div className="login-container">

                <div className="login-left">

                    <div className="login-brand">
                        <span className="login-brand-icon">
                            <i className="bi bi-chat-dots-fill"></i>
                        </span>
                        <span>WhatsApp Connect</span>
                    </div>

                    <div className="login-left-content">

                        <span className="login-tagline">
                            <i className="bi bi-stars"></i>
                            BUSINESS MESSAGING PLATFORM
                        </span>

                        <h1>
                            Connect.
                            <br />
                            Communicate.
                            <br />
                            <span>Grow.</span>
                        </h1>

                        <p>
                            Manage your WhatsApp Business communication
                            from one simple and powerful platform.
                        </p>

                        <div className="login-features">
                            <div>
                                <i className="bi bi-check-circle-fill"></i>
                                Easy WhatsApp integration
                            </div>

                            <div>
                                <i className="bi bi-check-circle-fill"></i>
                                Centralized conversations
                            </div>

                            <div>
                                <i className="bi bi-check-circle-fill"></i>
                                Secure account access
                            </div>
                        </div>

                    </div>

                    <div className="login-left-footer">
                        © 2026 WhatsApp Connect. All rights reserved.
                    </div>

                </div>

                <div className="login-right">

                    <div className="login-form-wrapper">

                        <div className="login-mobile-brand">
                            <i className="bi bi-chat-dots-fill"></i>
                            WhatsApp Connect
                        </div>

                        <div className="login-heading">
                            <span>WELCOME BACK</span>
                            <h2>Sign in to your account</h2>
                            <p>
                                Enter your credentials to access your dashboard.
                            </p>
                        </div>

                        <form onSubmit={handleLogin}>

                            <div className="login-form-group">
                                <label htmlFor="email">Email Address</label>

                                <div className="login-input-wrapper">
                                    <i className="bi bi-envelope"></i>

                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="login-form-group">
                                <label htmlFor="password">Password</label>

                                <div className="login-input-wrapper">
                                    <i className="bi bi-lock"></i>

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                        disabled={loading}
                                    />

                                    <button
                                        type="button"
                                        className="login-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        disabled={loading}
                                    >
                                        <i
                                            className={`bi ${
                                                showPassword
                                                    ? "bi-eye-slash"
                                                    : "bi-eye"
                                            }`}
                                        ></i>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="login-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="login-button-spinner"></span>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <i className="bi bi-arrow-right"></i>
                                    </>
                                )}
                            </button>

                        </form>

                        <div className="login-security-note">
                            <i className="bi bi-shield-lock-fill"></i>
                            Your account information is securely protected.
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;
