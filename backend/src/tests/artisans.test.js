const request = require('supertest');
const express = require('express');
const artisansRouter = require('../routes/artisans');
const pool = require('../config/db');
const generateHash = require('../../generateHash');

const app = express();
app.use(express.json());
app.use('/api/artisans', artisansRouter);

// Mock du pool de connexion
jest.mock('../config/db', () => ({
    query: jest.fn(),
    getConnection: jest.fn()
}));

// Mock de generateHash
jest.mock('../../generateHash', () => jest.fn().mockResolvedValue('hashedPassword'));

describe('Artisans API', () => {
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

    describe('GET /api/artisans', () => {
        it('devrait retourner la liste des artisans', async () => {
            const mockArtisans = [{
                user_id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                role: 'artisan',
                date_creation: '2024-01-01',
                specialites: 'Plomberie,Électricité',
                disponible: true,
                note_moyenne: 4.5
            }];

            pool.query.mockResolvedValueOnce([mockArtisans]);

            const response = await request(app).get('/api/artisans');

            expect(response.status).toBe(200);
            expect(response.body[0].specialites).toEqual(['Plomberie', 'Électricité']);
            expect(pool.query).toHaveBeenCalled();
        });

        it('devrait gérer les erreurs', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/api/artisans');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Erreur serveur');
        });
    });

    describe('GET /api/artisans/:user_id', () => {
        it('devrait retourner un artisan spécifique', async () => {
            const mockArtisan = [{
                user_id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                specialites: 'Plomberie,Électricité'
            }];

            pool.query.mockResolvedValueOnce([mockArtisan]);

            const response = await request(app).get('/api/artisans/1');

            expect(response.status).toBe(200);
            expect(response.body.specialites).toEqual(['Plomberie', 'Électricité']);
        });

        it('devrait retourner 404 si l\'artisan n\'existe pas', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/api/artisans/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Artisan non trouvé');
        });
    });

    describe('POST /api/artisans', () => {
        const newArtisan = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            specialites: ['Plomberie', 'Électricité']
        };

        it('devrait créer un nouvel artisan', async () => {
            // Mock pour la vérification de l'email
            pool.query.mockResolvedValueOnce([[]]); 

            // Mock pour l'insertion de l'utilisateur
            mockConnection.query
                .mockResolvedValueOnce([{ insertId: 1 }]) // Création user
                .mockResolvedValueOnce([]); // Création artisan

            // Mock pour la récupération de l'artisan créé
            pool.query.mockResolvedValueOnce([[{
                user_id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                role: 'artisan',
                specialites: 'Plomberie,Électricité'
            }]]);

            const response = await request(app)
                .post('/api/artisans')
                .send(newArtisan);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Artisan créé avec succès');
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('devrait retourner une erreur si l\'email existe déjà', async () => {
            pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // Email existe déjà

            const response = await request(app)
                .post('/api/artisans')
                .send(newArtisan);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Cet email est déjà utilisé');
        });

        it('devrait gérer les erreurs de transaction', async () => {
            pool.query.mockResolvedValueOnce([[]]); // Email n'existe pas
            mockConnection.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/api/artisans')
                .send(newArtisan);

            expect(response.status).toBe(500);
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('PUT /api/artisans/:user_id', () => {
        const updateData = {
            firstName: 'John Updated',
            lastName: 'Doe Updated',
            email: 'john.updated@example.com',
            specialites: ['Plomberie', 'Électricité'],
            years_experience: 5
        };

        it('devrait mettre à jour un artisan', async () => {
            // Mock pour la vérification de l'artisan
            pool.query.mockResolvedValueOnce([[{
                user_id: 1,
                email: 'john@example.com'
            }]]);

            // Mock pour la vérification de l'email
            pool.query.mockResolvedValueOnce([[]]);

            // Mock pour la récupération de l'artisan mis à jour
            pool.query.mockResolvedValueOnce([[{
                user_id: 1,
                firstName: 'John Updated',
                lastName: 'Doe Updated',
                email: 'john.updated@example.com',
                specialites: 'Plomberie,Électricité'
            }]]);

            const response = await request(app)
                .put('/api/artisans/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Artisan mis à jour avec succès');
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('devrait retourner 404 si l\'artisan n\'existe pas', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app)
                .put('/api/artisans/999')
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Artisan non trouvé');
        });

        it('devrait gérer les erreurs de transaction', async () => {
            pool.query.mockResolvedValueOnce([[{ user_id: 1, email: 'john@example.com' }]]);
            pool.query.mockResolvedValueOnce([[]]);
            mockConnection.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put('/api/artisans/1')
                .send(updateData);

            expect(response.status).toBe(500);
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/artisans/:user_id', () => {
        it('devrait supprimer un artisan', async () => {
            // Mock pour la vérification de l'artisan
            pool.query.mockResolvedValueOnce([[{ user_id: 1 }]]);

            const response = await request(app).delete('/api/artisans/1');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Artisan supprimé avec succès');
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('devrait retourner 404 si l\'artisan n\'existe pas', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).delete('/api/artisans/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Artisan non trouvé');
        });

        it('devrait gérer les erreurs de transaction', async () => {
            pool.query.mockResolvedValueOnce([[{ user_id: 1 }]]);
            mockConnection.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).delete('/api/artisans/1');

            expect(response.status).toBe(500);
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });
});
