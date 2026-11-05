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

        if (response.data.token) {
            sessionStorage.setItem(
                "access_token",
                response.data.token
            );
        }

        return response.data;
    },

    login: async (
        data: LoginUserRequest
    ): Promise<AuthResponse> => {

        if (typeof window !== "undefined") {
            sessionStorage.removeItem("access_token");
        }

        const response = await apiService.post<AuthResponse>(
            "/user/login",
            data
        );

        if (typeof window !== "undefined" && response.data.token) {
            sessionStorage.setItem(
                "access_token",
                response.data.token
            );
        }

        return response.data;
    },
    logout: (): void => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("access_token");
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