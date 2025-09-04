const { UserService } = require('../../services');
const { User, Artisan, Chef, Employe } = require('../../models');
const generateHash = require('../../../generateHash');

// Mock des dépendances
jest.mock('../../models');
jest.mock('../../../generateHash');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('devrait retourner tous les utilisateurs', async () => {
            const mockUsers = [
                { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'artisan' },
                { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'chef' }
            ];

            User.findAll.mockResolvedValue(mockUsers);

            const result = await UserService.getAllUsers();

            expect(result).toEqual(mockUsers);
            expect(User.findAll).toHaveBeenCalled();
        });
    });

    describe('getUserById', () => {
        it('devrait retourner un utilisateur avec ses informations de rôle (artisan)', async () => {
            const mockUser = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                role: 'artisan',
                toSafeObject: jest.fn().mockReturnValue({
                    id: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    role: 'artisan'
                })
            };

            const mockArtisan = {
                user_id: 1,
                specialites: ['Plomberie', 'Électricité'],
                disponible: true
            };

            User.findById.mockResolvedValue(mockUser);
            Artisan.findByUserId.mockResolvedValue(mockArtisan);

            const result = await UserService.getUserById(1);

            expect(result).toEqual({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                role: 'artisan',
                roleInfo: mockArtisan
            });
        });

        it('devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
            User.findById.mockResolvedValue(null);

            await expect(UserService.getUserById(999))
                .rejects.toThrow('Utilisateur non trouvé');
        });
    });

    describe('createUser', () => {
        it('devrait créer un artisan avec succès', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                role: 'artisan',
                specialites: ['Plomberie', 'Électricité']
            };

            User.checkEmailExists.mockResolvedValue(false);
            generateHash.mockResolvedValue('hashedPassword');
            User.create.mockResolvedValue(1);
            Artisan.create.mockResolvedValue();

            const result = await UserService.createUser(userData);

            expect(result).toEqual({ userId: 1 });
            expect(User.create).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'artisan'
            });
            expect(Artisan.create).toHaveBeenCalledWith(1, { specialites: ['Plomberie', 'Électricité'] });
        });

        it('devrait lever une erreur si l\'email existe déjà', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'existing@example.com',
                role: 'artisan',
                specialites: ['Plomberie']
            };

            User.checkEmailExists.mockResolvedValue(true);

            await expect(UserService.createUser(userData))
                .rejects.toThrow('Cette adresse email est déjà utilisée');
        });

        it('devrait lever une erreur si les spécialités manquent pour un artisan', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                role: 'artisan'
                // specialites manquantes
            };

            User.checkEmailExists.mockResolvedValue(false);

            await expect(UserService.createUser(userData))
                .rejects.toThrow('Spécialités requises pour un artisan');
        });
    });

    describe('validateRole', () => {
        it('devrait valider un rôle correct', () => {
            expect(() => UserService.validateRole('artisan')).not.toThrow();
            expect(() => UserService.validateRole('chef')).not.toThrow();
            expect(() => UserService.validateRole('employe')).not.toThrow();
            expect(() => UserService.validateRole('admin')).not.toThrow();
        });

        it('devrait lever une erreur pour un rôle invalide', () => {
            expect(() => UserService.validateRole('invalid')).toThrow('Role invalide');
            expect(() => UserService.validateRole('')).toThrow('Role invalide');
            expect(() => UserService.validateRole(null)).toThrow('Role invalide');
        });
    });

    describe('deleteUser', () => {
        it('devrait supprimer un utilisateur avec succès', async () => {
            User.delete.mockResolvedValue(true);

            const result = await UserService.deleteUser(1);

            expect(result).toEqual({ message: 'Utilisateur supprimé avec succès' });
            expect(User.delete).toHaveBeenCalledWith(1);
        });

        it('devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
            User.delete.mockResolvedValue(false);

            await expect(UserService.deleteUser(999))
                .rejects.toThrow('Utilisateur non trouvé');
        });
    });
});
