import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";

const apiService = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

apiService.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {

        if (typeof window !== "undefined") {
            const token = sessionStorage.getItem("access_token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

apiService.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {

        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                sessionStorage.removeItem("access_token");
            }
        }

        return Promise.reject(error);
    }
);

export default apiService;