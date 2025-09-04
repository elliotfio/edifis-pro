const request = require('supertest');
const express = require('express');
const { AuthController } = require('../../controllers');
const { AuthService } = require('../../services');

// Mock du service
jest.mock('../../services');

const app = express();
app.use(express.json());

// Routes de test
app.post('/login', AuthController.login);
app.get('/me', (req, res, next) => {
    req.user = { id: 1 }; // Mock user from JWT middleware
    next();
}, AuthController.getMe);
app.post('/refresh-token', AuthController.refreshToken);
app.post('/request-password-reset', AuthController.requestPasswordReset);
app.post('/logout', AuthController.logout);

describe('AuthController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /login', () => {
        it('devrait connecter un utilisateur avec succès', async () => {
            const mockResult = {
                user: { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
                access_token: 'access_token',
                refresh_token: 'refresh_token'
            };

            AuthService.login.mockResolvedValue(mockResult);

            const response = await request(app)
                .post('/login')
                .send({ email: 'test@example.com', password: 'password' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Connexion réussie !',
                ...mockResult
            });
            expect(AuthService.login).toHaveBeenCalledWith('test@example.com', 'password');
        });

        it('devrait retourner une erreur 401 pour des identifiants incorrects', async () => {
            const error = new Error('Identifiants incorrects');
            error.statusCode = 401;
            error.attemptCount = 1;

            AuthService.login.mockRejectedValue(error);

            const response = await request(app)
                .post('/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                message: 'Identifiants incorrects',
                attemptCount: 1
            });
        });

        it('devrait retourner une erreur 429 pour trop de tentatives', async () => {
            const error = new Error('Trop de tentatives de connexion');
            error.statusCode = 429;
            error.remainingTime = 30;
            error.attemptCount = 3;

            AuthService.login.mockRejectedValue(error);

            const response = await request(app)
                .post('/login')
                .send({ email: 'test@example.com', password: 'password' });

            expect(response.status).toBe(429);
            expect(response.body).toEqual({
                message: 'Trop de tentatives de connexion',
                remainingTime: 30,
                attemptCount: 3
            });
        });
    });

    describe('GET /me', () => {
        it('devrait retourner les informations de l\'utilisateur connecté', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'artisan'
            };

            AuthService.getMe.mockResolvedValue(mockUser);

            const response = await request(app).get('/me');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUser);
            expect(AuthService.getMe).toHaveBeenCalledWith(1);
        });

        it('devrait retourner une erreur 404 si l\'utilisateur n\'existe pas', async () => {
            const error = new Error('Utilisateur non trouvé');
            error.statusCode = 404;

            AuthService.getMe.mockRejectedValue(error);

            const response = await request(app).get('/me');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Utilisateur non trouvé' });
        });
    });

    describe('POST /refresh-token', () => {
        it('devrait rafraîchir les tokens avec succès', async () => {
            const mockTokens = {
                access_token: 'new_access_token',
                refresh_token: 'new_refresh_token'
            };

            AuthService.refreshToken.mockResolvedValue(mockTokens);

            const response = await request(app)
                .post('/refresh-token')
                .send({ refreshToken: 'valid_refresh_token' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTokens);
            expect(AuthService.refreshToken).toHaveBeenCalledWith('valid_refresh_token');
        });

        it('devrait retourner une erreur 403 pour un token invalide', async () => {
            const error = new Error('Refresh token invalide');
            error.statusCode = 403;

            AuthService.refreshToken.mockRejectedValue(error);

            const response = await request(app)
                .post('/refresh-token')
                .send({ refreshToken: 'invalid_token' });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: 'Refresh token invalide' });
        });
    });

    describe('POST /request-password-reset', () => {
        it('devrait traiter une demande de réinitialisation de mot de passe', async () => {
            const mockResult = {
                message: 'Mot de passe réinitialisé avec succès.',
                tempPassword: 'doe.john.temp',
                note: 'Veuillez changer ce mot de passe temporaire après votre première connexion.'
            };

            AuthService.requestPasswordReset.mockResolvedValue(mockResult);

            const response = await request(app)
                .post('/request-password-reset')
                .send({ email: 'test@example.com' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResult);
            expect(AuthService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
        });

        it('devrait retourner une erreur 400 si l\'email manque', async () => {
            const error = new Error('Email requis');
            error.statusCode = 400;

            AuthService.requestPasswordReset.mockRejectedValue(error);

            const response = await request(app)
                .post('/request-password-reset')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Email requis' });
        });
    });

    describe('POST /logout', () => {
        it('devrait déconnecter l\'utilisateur', async () => {
            const response = await request(app).post('/logout');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Déconnexion réussie' });
        });
    });
});
