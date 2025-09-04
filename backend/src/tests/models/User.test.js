const { User } = require('../../models');
const pool = require('../../config/db');

// Mock du pool de connexion
jest.mock('../../config/db', () => ({
    query: jest.fn()
}));

describe('User Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('devrait retourner tous les utilisateurs', async () => {
            const mockUsers = [
                { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'artisan', date_creation: '2024-01-01' },
                { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'chef', date_creation: '2024-01-02' }
            ];

            pool.query.mockResolvedValue([mockUsers]);

            const result = await User.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(User);
            expect(result[0].firstName).toBe('John');
            expect(pool.query).toHaveBeenCalledWith(
                "SELECT id, firstName, lastName, email, role, date_creation FROM users"
            );
        });
    });

    describe('findById', () => {
        it('devrait retourner un utilisateur par ID', async () => {
            const mockUser = [{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'artisan', date_creation: '2024-01-01' }];
            
            pool.query.mockResolvedValue([mockUser]);

            const result = await User.findById(1);

            expect(result).toBeInstanceOf(User);
            expect(result.firstName).toBe('John');
            expect(pool.query).toHaveBeenCalledWith(
                "SELECT id, firstName, lastName, email, role, date_creation FROM users WHERE id = ?",
                [1]
            );
        });

        it('devrait retourner null si aucun utilisateur trouvé', async () => {
            pool.query.mockResolvedValue([[]]);

            const result = await User.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('findByEmail', () => {
        it('devrait retourner un utilisateur par email', async () => {
            const mockUser = [{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'artisan', password: 'hashedPassword' }];
            
            pool.query.mockResolvedValue([mockUser]);

            const result = await User.findByEmail('john@example.com');

            expect(result).toBeInstanceOf(User);
            expect(result.email).toBe('john@example.com');
            expect(pool.query).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE email = ?",
                ['john@example.com']
            );
        });
    });

    describe('create', () => {
        it('devrait créer un nouvel utilisateur', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'artisan'
            };

            pool.query.mockResolvedValue([{ insertId: 1 }]);

            const result = await User.create(userData);

            expect(result).toBe(1);
            expect(pool.query).toHaveBeenCalledWith(
                "INSERT INTO users (firstName, lastName, email, password, role, date_creation) VALUES (?, ?, ?, ?, ?, ?)",
                expect.arrayContaining(['John', 'Doe', 'john@example.com', 'hashedPassword', 'artisan'])
            );
        });
    });

    describe('update', () => {
        it('devrait mettre à jour un utilisateur', async () => {
            const userData = {
                firstName: 'John Updated',
                lastName: 'Doe Updated',
                email: 'john.updated@example.com',
                role: 'chef',
                password: 'newHashedPassword'
            };

            const mockUpdatedUser = { id: 1, ...userData };
            pool.query.mockResolvedValueOnce([]) // pour l'update
                      .mockResolvedValueOnce([[mockUpdatedUser]]); // pour le findById

            const result = await User.update(1, userData);

            expect(result).toBeInstanceOf(User);
            expect(result.firstName).toBe('John Updated');
            expect(pool.query).toHaveBeenCalledWith(
                "UPDATE users SET firstName = ?, lastName = ?, email = ?, role = ?, password = ? WHERE id = ?",
                ['John Updated', 'Doe Updated', 'john.updated@example.com', 'chef', 'newHashedPassword', 1]
            );
        });
    });

    describe('delete', () => {
        it('devrait supprimer un utilisateur', async () => {
            pool.query.mockResolvedValue([{ affectedRows: 1 }]);

            const result = await User.delete(1);

            expect(result).toBe(true);
            expect(pool.query).toHaveBeenCalledWith("DELETE FROM users WHERE id = ?", [1]);
        });

        it('devrait retourner false si aucun utilisateur supprimé', async () => {
            pool.query.mockResolvedValue([{ affectedRows: 0 }]);

            const result = await User.delete(999);

            expect(result).toBe(false);
        });
    });

    describe('checkEmailExists', () => {
        it('devrait retourner true si l\'email existe', async () => {
            pool.query.mockResolvedValue([[{ id: 1 }]]);

            const result = await User.checkEmailExists('existing@example.com');

            expect(result).toBe(true);
        });

        it('devrait retourner false si l\'email n\'existe pas', async () => {
            pool.query.mockResolvedValue([[]]);

            const result = await User.checkEmailExists('nonexistent@example.com');

            expect(result).toBe(false);
        });

        it('devrait exclure un ID spécifique', async () => {
            pool.query.mockResolvedValue([[]]);

            const result = await User.checkEmailExists('test@example.com', 1);

            expect(result).toBe(false);
            expect(pool.query).toHaveBeenCalledWith(
                "SELECT id FROM users WHERE email = ? AND id != ?",
                ['test@example.com', 1]
            );
        });
    });

    describe('toSafeObject', () => {
        it('devrait retourner l\'objet sans le mot de passe', () => {
            const userData = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'artisan',
                date_creation: '2024-01-01'
            };

            const user = new User(userData);
            const safeObject = user.toSafeObject();

            expect(safeObject).not.toHaveProperty('password');
            expect(safeObject).toEqual({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                role: 'artisan',
                date_creation: '2024-01-01'
            });
        });
    });
});
