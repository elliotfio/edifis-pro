const { AuthService } = require('../../services');
const { User } = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bruteForceProtection = require('../../utils/bruteForceProtection');

// Mock des dépendances
jest.mock('../../models');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../utils/bruteForceProtection');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    });

    describe('login', () => {
        it('devrait connecter un utilisateur avec des identifiants valides', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                firstName: 'John',
                lastName: 'Doe',
                role: 'artisan',
                toSafeObject: jest.fn().mockReturnValue({
                    id: 1,
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'artisan'
                })
            };

            bruteForceProtection.checkAttempts.mockResolvedValue({ allowed: true });
            User.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            bruteForceProtection.recordSuccessfulLogin.mockResolvedValue();
            jwt.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

            const result = await AuthService.login('test@example.com', 'password');

            expect(result).toEqual({
                user: mockUser.toSafeObject(),
                access_token: 'access_token',
                refresh_token: 'refresh_token'
            });
            expect(bruteForceProtection.recordSuccessfulLogin).toHaveBeenCalledWith('test@example.com');
        });

        it('devrait rejeter une connexion avec un mot de passe incorrect', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword'
            };

            bruteForceProtection.checkAttempts.mockResolvedValue({ allowed: true });
            User.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            bruteForceProtection.recordFailedAttempt.mockResolvedValue({ 
                attemptCount: 1, 
                requiresPasswordReset: false 
            });

            await expect(AuthService.login('test@example.com', 'wrongpassword'))
                .rejects.toThrow('Identifiants incorrects');
        });

        it('devrait rejeter une connexion avec un email inexistant', async () => {
            bruteForceProtection.checkAttempts.mockResolvedValue({ allowed: true });
            User.findByEmail.mockResolvedValue(null);
            bruteForceProtection.recordFailedAttempt.mockResolvedValue();

            await expect(AuthService.login('nonexistent@example.com', 'password'))
                .rejects.toThrow('Identifiants incorrects');
        });

        it('devrait bloquer une connexion si trop de tentatives', async () => {
            bruteForceProtection.checkAttempts.mockResolvedValue({ 
                allowed: false, 
                remainingTime: 30,
                requiresPasswordReset: false,
                attemptCount: 3
            });
            bruteForceProtection.formatRemainingTime.mockReturnValue('30 secondes');

            await expect(AuthService.login('test@example.com', 'password'))
                .rejects.toThrow('Trop de tentatives de connexion');
        });
    });

    describe('getMe', () => {
        it('devrait retourner les informations de l\'utilisateur', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'artisan',
                toSafeObject: jest.fn().mockReturnValue({
                    id: 1,
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'artisan'
                })
            };

            User.findById.mockResolvedValue(mockUser);

            const result = await AuthService.getMe(1);

            expect(result).toEqual(mockUser.toSafeObject());
            expect(User.findById).toHaveBeenCalledWith(1);
        });

        it('devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
            User.findById.mockResolvedValue(null);

            await expect(AuthService.getMe(999))
                .rejects.toThrow('Utilisateur non trouvé');
        });
    });

    describe('refreshToken', () => {
        it('devrait rafraîchir un token valide', async () => {
            const mockUser = { id: 1, role: 'artisan' };
            
            jwt.verify.mockReturnValue({ id: 1 });
            User.findById.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValueOnce('new_access_token').mockReturnValueOnce('new_refresh_token');

            const result = await AuthService.refreshToken('valid_refresh_token');

            expect(result).toEqual({
                access_token: 'new_access_token',
                refresh_token: 'new_refresh_token'
            });
        });

        it('devrait rejeter un token invalide', async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Token invalide');
            });

            await expect(AuthService.refreshToken('invalid_token'))
                .rejects.toThrow('Refresh token invalide');
        });
    });
});
