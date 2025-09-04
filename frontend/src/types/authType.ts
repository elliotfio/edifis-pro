import { User } from "./userType";

// Données d'inscription
export interface RegisterCredentials {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

// Données de connexion
export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  // Réponse de l'API après authentification
  export interface AuthResponse {
    access_token: string;
    refresh_token: string;
  }
  
  // Réponse complète incluant l'utilisateur
  export interface AuthResponseWithUser extends AuthResponse {
    user: User;
  }
  
  // Type pour le refresh token
  export interface RefreshTokenRequest {
    token: string;
  }

  // Erreur de brute force
  export interface BruteForceError {
    message: string;
    attemptCount?: number;
    remainingTime?: number;
    requiresPasswordReset?: boolean;
  }

  // Réponse de réinitialisation de mot de passe
  export interface PasswordResetResponse {
    message: string;
    tempPassword?: string;
    note?: string;
  }