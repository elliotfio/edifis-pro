import Cookies from 'js-cookie';
import { AuthResponse } from '@/types';

class Interceptor {
    private url: string;
    private isRefreshing: boolean = false;
    private refreshFailed: boolean = false;

    constructor() {
        this.url = import.meta.env.VITE_API_BASE_URL as string;
    }

    public getUrl(): string {
        return this.url;
    }

    private createHeaders(includeAuth: boolean = false, isFormData: boolean = false): HeadersInit {
        const headers: HeadersInit = {};
        
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        
        if (includeAuth) {
            const token = Cookies.get('access_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }

    private async handleUnauthorizedRequest(
        response: Response,
        retryRequest: () => Promise<Response>
    ): Promise<Response> {
        if (response.status === 401) {
            const refreshToken = Cookies.get("refresh_token");
    
            if (this.isRefreshing || this.refreshFailed || !refreshToken) {
                return response;
            }
    
            this.isRefreshing = true;
    
            try {
                const newTokens = await this.getNewAccessToken(refreshToken);
                this.isRefreshing = false;
    
                if (newTokens && newTokens.access_token) {
                    return retryRequest();
                } else {
                    throw new Error("Le refresh token est invalide");
                }
            } catch (error) {
                console.error("Erreur lors du rafraîchissement du token:", error);
                this.refreshFailed = true;
                this.isRefreshing = false;
                this.logoutUser();
                return response;
            }
        }
    
        return response;
    }

    public async fetchRequest(
        endpoint: string,
        method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
        body: any = null,
        includeAuth: boolean = false
    ): Promise<any> {
        const isFormData = body instanceof FormData;
        const fullUrl = `${this.url}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    
        const options: RequestInit = {
            method,
            headers: this.createHeaders(includeAuth, isFormData),
        };
    
        if (body) {
            options.body = isFormData ? body : JSON.stringify(body);
        }
    
        try {
            let response = await fetch(fullUrl, options);
    
            response = await this.handleUnauthorizedRequest(response, () =>
                this.fetchRequest(endpoint, method, body, includeAuth)
            );
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Response error:", errorData);
                throw new Error(errorData.message || `${method} request failed: ${response.statusText}`);
            }
    
            if (method === "DELETE" && response.status === 204) {
                return { success: true };
            }
    
            return response.json();
        } catch (error: any) {
            console.error("Request error:", error);
            throw new Error(error.message || "Une erreur est survenue lors de la requête");
        }
    }

    public async getNewAccessToken(refreshToken: string): Promise<AuthResponse | null> {
        try {
            const response = await this.fetchRequest("/api/auth/refresh-token", "POST", { refreshToken });

            if (response.accessToken) {
                Cookies.set("access_token", response.accessToken, { expires: 1 });
            }

            if (response.refreshToken) {
                Cookies.set("refresh_token", response.refreshToken, { expires: 7 });
            }

            this.refreshFailed = false;
            return response;
        } catch (error) {
            console.error("Échec du rafraîchissement du token, déconnexion...");
            this.logoutUser();
            return null;
        }
    }

    private logoutUser() {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        this.refreshFailed = true;
        window.location.href = "/login";
    }
}

export const api = new Interceptor();
