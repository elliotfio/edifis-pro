const request = require('supertest');
const express = require('express');
const chefsRouter = require('../routes/chefs');
const pool = require('../config/db');
const generateHash = require('../../generateHash');

const app = express();
app.use(express.json());
app.use('/api/chefs', chefsRouter);

// Mock du pool de connexion
jest.mock('../config/db', () => ({
    query: jest.fn(),
    getConnection: jest.fn()
}));

// Mock de generateHash
jest.mock('../../generateHash', () => jest.fn().mockResolvedValue('hashedPassword'));

describe('Chefs API', () => {
    let mockConnection;

    beforeEach(() => {
        // Reset tous les mocks avant chaque test
        jest.clearAllMocks();

        // Mock de la connexion pour les transactions
        mockConnection = {
            query: jest.fn(),
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn()
        };
        pool.getConnection.mockResolvedValue(mockConnection);
    });

    describe('GET /api/chefs', () => {
        it('devrait retourner la liste des chefs', async () => {
            const mockChefs = [{
                user_id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                role: 'chef',
                date_creation: '2024-01-01',
                years_experience: '5',
                current_worksite: null,
                history_worksite: '["WS1", "WS2"]'
            }];

            pool.query.mockResolvedValueOnce([mockChefs]);

            const response = await request(app).get('/api/chefs');

            expect(response.status).toBe(200);
            expect(response.body[0].history_worksite).toEqual(['WS1', 'WS2']);
            expect(pool.query).toHaveBeenCalled();
        });

        it('devrait gérer les erreurs', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/api/chefs');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Erreur serveur');
        });
    });

    describe('GET /api/chefs/:user_id', () => {
        it('devrait retourner un chef spécifique', async () => {
            const mockChef = [{
                user_id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                years_experience: '5',
                history_worksite: '["WS1", "WS2"]'
            }];

            pool.query.mockResolvedValueOnce([mockChef]);

            const response = await request(app).get('/api/chefs/1');

            expect(response.status).toBe(200);
            expect(response.body.history_worksite).toEqual(['WS1', 'WS2']);
        });

        it('devrait retourner 404 si le chef n\'existe pas', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/api/chefs/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Chef non trouvé');
        });
    });

    describe('POST /api/chefs', () => {
        const newChef = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            years_experience: '5'
        };

        it('devrait créer un nouveau chef', async () => {
            // Mock pour la vérification de l'email
            pool.query.mockResolvedValueOnce([[]]); 

            // Mock pour l'insertion de l'utilisateur
            mockConnection.query
                .mockResolvedValueOnce([{ insertId: 1 }]) // Création user
                .mockResolvedValueOnce([]); // Création chef

            // Mock pour la récupération du chef créé
            pool.query.mockResolvedValueOnce([[{
                user_id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                role: 'chef',
                years_experience: '5',
                history_worksite: null
            }]]);

            const response = await request(app)
                .post('/api/chefs')
                .send(newChef);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Chef créé avec succès');
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('devrait retourner une erreur si l\'email existe déjà', async () => {
            pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // Email existe déjà

            const response = await request(app)
                .post('/api/chefs')
                .send(newChef);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Cet email est déjà utilisé');
        });

        it('devrait gérer les erreurs de transaction', async () => {
            pool.query.mockResolvedValueOnce([[]]); // Email n'existe pas
            mockConnection.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/api/chefs')
                .send(newChef);

            expect(response.status).toBe(500);
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('PUT /api/chefs/:user_id', () => {
        const updateData = {
            firstName: 'John Updated',
            lastName: 'Doe Updated',
            email: 'john.updated@example.com',
            years_experience: '6'
        };

        it('devrait mettre à jour un chef', async () => {
            // Mock pour la vérification du chef
            pool.query.mockResolvedValueOnce([[{
                user_id: 1,
                email: 'john@example.com'
            }]]);

            // Mock pour la vérification de l'email
            pool.query.mockResolvedValueOnce([[]]);

            // Mock pour la récupération du chef mis à jour
            pool.query.mockResolvedValueOnce([[{
                user_id: 1,
                firstName: 'John Updated',
                lastName: 'Doe Updated',
                email: 'john.updated@example.com',
                years_experience: '6',
                history_worksite: null
            }]]);

            const response = await request(app)
                .put('/api/chefs/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Chef mis à jour avec succès');
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('devrait retourner 404 si le chef n\'existe pas', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app)
                .put('/api/chefs/999')
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Chef non trouvé');
        });

        it('devrait gérer les erreurs de transaction', async () => {
            pool.query.mockResolvedValueOnce([[{ user_id: 1, email: 'john@example.com' }]]);
            pool.query.mockResolvedValueOnce([[]]);
            mockConnection.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put('/api/chefs/1')
                .send(updateData);

            expect(response.status).toBe(500);
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/chefs/:user_id', () => {
        it('devrait supprimer un chef', async () => {
            // Mock pour la vérification du chef
            pool.query.mockResolvedValueOnce([[{ user_id: 1 }]]);

            const response = await request(app).delete('/api/chefs/1');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Chef supprimé avec succès');
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('devrait retourner 404 si le chef n\'existe pas', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).delete('/api/chefs/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Chef non trouvé');
        });

        it('devrait gérer les erreurs de transaction', async () => {
            pool.query.mockResolvedValueOnce([[{ user_id: 1 }]]);
            mockConnection.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).delete('/api/chefs/1');

            expect(response.status).toBe(500);
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });
});
