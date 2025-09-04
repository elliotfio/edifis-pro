import Cookies from 'js-cookie';
import { api } from '@/api/interceptor';
import { 
    ApiResponse, 
    LoginCredentials,
    AuthResponse,
    RefreshTokenRequest,
    User
} from '@/types';

class AuthService {
    public async loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.fetchRequest('/api/auth/login', 'POST', credentials);
        console.log('Login response:', response);
        if (response.access_token && response.refresh_token) { 
            Cookies.set('access_token', response.access_token, { expires: 1 });
            Cookies.set('refresh_token', response.refresh_token, { expires: 7 });
        }
        return response;
    }

    public async getUserByToken(accessToken: string): Promise<User | null> {
        if (!accessToken) {
            return null;
        }
        const response = await api.fetchRequest('/api/auth/me', 'GET', null, true);
        return response;
    }

    public async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await api.fetchRequest('/api/auth/refresh-token', 'POST', { refreshToken });
        if (response.access_token && response.refresh_token) {
            Cookies.set('access_token', response.access_token, { expires: 1 });
            Cookies.set('refresh_token', response.refresh_token, { expires: 7 });
        }
        return response;
    }

    public async logout(refreshToken: string): Promise<ApiResponse<void>> {
        const request: RefreshTokenRequest = { token: refreshToken };
        return api.fetchRequest('/api/auth/logout', 'POST', request);
    }

    public async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string; tempPassword?: string; note?: string }>> {
        return api.fetchRequest('/api/auth/request-password-reset', 'POST', { email });
    }
}

export const authService = new AuthService();