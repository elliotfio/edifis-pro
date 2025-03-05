const request = require('supertest');
const express = require('express');
const router = require('../routes/users');

jest.mock('../config/db', () => {
    return {
        query: jest.fn(),
        getConnection: jest.fn()
    };
});

const pool = require('../config/db');
const app = express();
app.use(express.json());
app.use('/api/users', router);

describe('User Routes', () => {
    let mockConnection;

    beforeEach(() => {
        jest.clearAllMocks();
        console.log('🧪 Starting new test...');

        mockConnection = {
            beginTransaction: jest.fn().mockResolvedValue(undefined),
            query: jest.fn(),
            commit: jest.fn().mockResolvedValue(undefined),
            rollback: jest.fn().mockResolvedValue(undefined),
            release: jest.fn().mockResolvedValue(undefined)
        };

        pool.getConnection.mockResolvedValue(mockConnection);
    });

    afterEach(() => {
        console.log('✅ Test completed');
    });

    describe('GET /api/users', () => {
        it('should return all users', async () => {
            console.log('📝 Testing GET all users');
            const mockUsers = [
                { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@edifis.fr', role: 'artisan' },
                { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@edifis.fr', role: 'chef' }
            ];

            pool.query.mockResolvedValueOnce([mockUsers]);

            const response = await request(app).get('/api/users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUsers);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT id, firstName, lastName, email, role, date_creation FROM users'
            );
        });

        it('should handle database errors', async () => {
            console.log('📝 Testing GET error handling');
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/api/users');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Erreur serveur');
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return a specific user with role info - artisan', async () => {
            console.log('📝 Testing GET specific artisan');
            const mockUser = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@edifis.fr',
                role: 'artisan'
            };

            const mockArtisanInfo = {
                specialites: 'plomberie,électricité',
                disponible: true,
                note_moyenne: 4.5,
                current_worksite: null
            };

            pool.query
                .mockResolvedValueOnce([[mockUser]])
                .mockResolvedValueOnce([[mockArtisanInfo]]);

            const response = await request(app).get('/api/users/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                ...mockUser,
                roleInfo: mockArtisanInfo
            });
        });

        it('should return a specific user with role info - chef', async () => {
            console.log('📝 Testing GET specific chef');
            const mockUser = {
                id: 2,
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@edifis.fr',
                role: 'chef'
            };

            const mockChefInfo = {
                years_experience: '10',
                current_worksite: null
            };

            pool.query
                .mockResolvedValueOnce([[mockUser]])
                .mockResolvedValueOnce([[mockChefInfo]]);

            const response = await request(app).get('/api/users/2');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                ...mockUser,
                roleInfo: mockChefInfo
            });
        });

        it('should return 404 for non-existent user', async () => {
            console.log('📝 Testing GET 404 response');
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/api/users/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Utilisateur non trouvé');
        });
    });

    describe('POST /api/users', () => {
        it('should create a new artisan user', async () => {
            console.log('📝 Testing POST new artisan user');
            const mockUser = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@edifis.fr',
                password: 'hashedPassword',
                role: 'artisan',
                specialites: ['plomberie', 'électricité']
            };

            mockConnection.query
                .mockResolvedValueOnce([{ insertId: 1 }])  // users insert
                .mockResolvedValueOnce([{ affectedRows: 1 }]);  // artisan insert

            const response = await request(app)
                .post('/api/users')
                .send(mockUser);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Utilisateur créé avec succès');
            expect(response.body.userId).toBe(1);
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('should create a new chef user', async () => {
            console.log('📝 Testing POST new chef user');
            const mockUser = {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@edifis.fr',
                password: 'hashedPassword',
                role: 'chef',
                years_experience: '10'
            };

            mockConnection.query
                .mockResolvedValueOnce([{ insertId: 2 }])  // users insert
                .mockResolvedValueOnce([{ affectedRows: 1 }]);  // chef insert

            const response = await request(app)
                .post('/api/users')
                .send(mockUser);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Utilisateur créé avec succès');
            expect(response.body.userId).toBe(2);
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('should handle missing specialites for artisan', async () => {
            console.log('📝 Testing POST artisan validation');
            const mockUser = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@edifis.fr',
                password: 'hashedPassword',
                role: 'artisan'
            };

            mockConnection.query.mockResolvedValueOnce([{ insertId: 3 }]);

            const response = await request(app)
                .post('/api/users')
                .send(mockUser);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Les spécialités sont requises pour un artisan');
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update an artisan user', async () => {
            console.log('📝 Testing PUT update artisan');
            const mockUpdate = {
                firstName: 'John Updated',
                email: 'john.updated@edifis.fr',
                specialites: ['plomberie', 'électricité', 'maçonnerie']
            };

            mockConnection.query
                .mockResolvedValueOnce([{ affectedRows: 1 }])  // users update
                .mockResolvedValueOnce([[{ role: 'artisan' }]])  // get role
                .mockResolvedValueOnce([{ affectedRows: 1 }]);  // artisan update

            const response = await request(app)
                .put('/api/users/1')
                .send(mockUpdate);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Utilisateur mis à jour avec succès');
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('should update a chef user', async () => {
            console.log('📝 Testing PUT update chef');
            const mockUpdate = {
                firstName: 'Jane Updated',
                years_experience: '15'
            };

            mockConnection.query
                .mockResolvedValueOnce([{ affectedRows: 1 }])  // users update
                .mockResolvedValueOnce([[{ role: 'chef' }]])  // get role
                .mockResolvedValueOnce([{ affectedRows: 1 }]);  // chef update

            const response = await request(app)
                .put('/api/users/2')
                .send(mockUpdate);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Utilisateur mis à jour avec succès');
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete a user', async () => {
            console.log('📝 Testing DELETE user');
            mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app).delete('/api/users/1');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Utilisateur supprimé avec succès');
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('should handle database errors during deletion', async () => {
            console.log('📝 Testing DELETE error handling');
            mockConnection.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).delete('/api/users/1');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Erreur serveur');
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });
    });
});
