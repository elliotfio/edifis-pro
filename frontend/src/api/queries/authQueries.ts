import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/api/authService";
import { AuthResponse, PasswordResetResponse } from "@/types";
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
    const { login, setUser, setIsAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    return useMutation<
        { access_token: string; refresh_token: string },
        Error,                                         
        { email: string; password: string }
    >({
        mutationFn: async ({ email, password }) => {
            const response = await authService.loginUser({ email, password });
            if (response.access_token && response.refresh_token) {
                login(response.access_token, response.refresh_token);
                return { access_token: response.access_token, refresh_token: response.refresh_token };
            } else {
                throw new Error('Login failed');
            }
        },
        onSuccess: async (response: AuthResponse) => {
            login(response.access_token, response.refresh_token);
            // Récupérer les informations de l'utilisateur
            const userData = await authService.getUserByToken(response.access_token);
            console.log('User data:', userData);
            setUser(userData);
            console.log('Login successful');
            setIsAuthenticated(true);
            navigate('/worksites');
        },
    });
};

export const useAutoLogin = () => {
    const { login, setUser, setIsAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    return useQuery({
        queryKey: ['autoLogin'],
        queryFn: async () => {
            const access_token = Cookies.get('access_token');
            const refresh_token = Cookies.get('refresh_token');

            if (access_token && refresh_token) {
                try {
                    const userData = await authService.getUserByToken(access_token);
                    if (userData) {
                        login(access_token, refresh_token);
                        setUser(userData);
                        setIsAuthenticated(true);
                        navigate('/worksites');
                        return true;
                    }
                } catch (error) {
                    console.error('Failed to fetch user by token:', error);
                    if (refresh_token) {
                        try {
                            const newTokens = await authService.refreshToken(refresh_token);
                            if (!newTokens) throw new Error('Failed to refresh tokens');

                            const userData = await authService.getUserByToken(newTokens.access_token);
                            if (userData) {
                                login(newTokens.access_token, newTokens.refresh_token);
                                setUser(userData);
                                setIsAuthenticated(true);
                                console.log('Auto login successful with refreshed token');
                                navigate('/worksites');
                                return true;
                            }
                        } catch (refreshError) {
                            console.error('Failed to refresh token, user needs to log in again.');
                            handleLogout();
                        }
                    }
                }
            } else {
                handleLogout();
                console.log('No token available in localStorage');
            }
            return false;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};

export const useLogout = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async () => {
            const refresh_token = Cookies.get('refresh_token');
            if (refresh_token) {
                await authService.logout(refresh_token);
                handleLogout();
                navigate('/login');
            }
        },
    });
};

export const usePasswordReset = () => {
    return useMutation<
        PasswordResetResponse,
        Error,
        string
    >({
        mutationFn: async (email: string) => {
            return await authService.requestPasswordReset(email);
        },
    });
};

const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    useAuthStore.getState().logout();
};
