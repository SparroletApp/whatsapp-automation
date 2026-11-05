import apiService from "./apiservice";

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    status: boolean;
    createdAt: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: UserResponse;
}

const userService = {

    register: async (
        data: CreateUserRequest
    ): Promise<AuthResponse> => {

        const response = await apiService.post<AuthResponse>(
            "/user/register",
            data
        );

        if (typeof window !== "undefined") {
            sessionStorage.setItem(
                "access_token",
                response.data.token
            );

            sessionStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );
        }

        return response.data;
    },

    login: async (
        data: LoginUserRequest
    ): Promise<AuthResponse> => {

        // Clear previous session
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("user");
        }

        const response = await apiService.post<AuthResponse>(
            "/user/login",
            data
        );

        if (typeof window !== "undefined") {

            if (!response.data.token || !response.data.user) {
                throw new Error("Invalid login response.");
            }

            // Save JWT token
            sessionStorage.setItem(
                "access_token",
                response.data.token
            );

            // Save logged-in user
            sessionStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );
        }

        return response.data;
    },

    logout: (): void => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("user");
        }
    },

    isLoggedIn: (): boolean => {
        if (typeof window === "undefined") {
            return false;
        }

        return !!sessionStorage.getItem("access_token");
    },

};

export default userService;
