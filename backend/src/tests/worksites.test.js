const request = require('supertest');
const express = require('express');
const router = require('../routes/worksites');
const pool = require('../config/db');

// Mock de la connexion à la base de données
jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/api/worksites', router);

describe('Worksite Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.log('🧪 Starting new test...');
    });

    afterEach(() => {
        console.log('✅ Test completed');
    });

    describe('GET /api/worksites', () => {
        it('should return all worksites', async () => {
            console.log('📝 Testing GET all worksites');
            const mockWorksites = [
                {
                    id: '1',
                    name: 'Test Worksite',
                    coordinates: { x: '48.8566', y: '2.3522' },
                    specialities_needed: 'plomberie, électricité'
                }
            ];

            pool.query.mockResolvedValueOnce([mockWorksites]);

            const response = await request(app).get('/api/worksites');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockWorksites);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM worksites');
        });

        it('should handle database errors', async () => {
            console.log('📝 Testing GET error handling');
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/api/worksites');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Erreur serveur');
        });
    });

    describe('GET /api/worksites/:id', () => {
        it('should return a specific worksite', async () => {
            console.log('📝 Testing GET specific worksite');
            const mockWorksite = {
                id: '1',
                name: 'Test Worksite',
                coordinates: { x: '48.8566', y: '2.3522' },
                specialities_needed: 'plomberie, électricité',
                cost: '1000',
                budget: '2000'
            };

            pool.query.mockResolvedValueOnce([[mockWorksite]]);

            const response = await request(app).get('/api/worksites/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                ...mockWorksite,
                coordinates: {
                    x: 48.8566,
                    y: 2.3522
                },
                cost: 1000,
                budget: 2000,
                specialities_needed: ['plomberie', 'électricité']
            });
        });

        it('should return 404 for non-existent worksite', async () => {
            console.log('📝 Testing GET 404 response');
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/api/worksites/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Chantier non trouvé');
        });
    });

    describe('POST /api/worksites', () => {
        const mockWorksite = {
            name: 'New Worksite',
            address: '123 Test St',
            coordinates: { x: 48.8566, y: 2.3522 },
            startDate: '2025-03-05',
            endDate: '2025-04-05',
            budget: '10000',
            cost: '8000',
            specialities_needed: ['plomberie', 'électricité']
        };

        it('should create a new worksite', async () => {
            console.log('📝 Testing POST new worksite');
            pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

            const response = await request(app)
                .post('/api/worksites')
                .send(mockWorksite);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Chantier créé avec succès');
            expect(response.body.worksite_id).toBeDefined();
        });

        it('should validate required fields', async () => {
            console.log('📝 Testing POST validation');
            const invalidWorksite = { name: 'Invalid Worksite' };

            const response = await request(app)
                .post('/api/worksites')
                .send(invalidWorksite);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Données manquantes');
            expect(response.body.missingFields).toBeDefined();
        });

        it('should validate coordinates', async () => {
            console.log('📝 Testing POST coordinates validation');
            const invalidWorksite = {
                ...mockWorksite,
                coordinates: { x: null, y: null }
            };

            const response = await request(app)
                .post('/api/worksites')
                .send(invalidWorksite);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Coordonnées invalides');
        });
    });

    describe('PUT /api/worksites/:id', () => {
        const mockWorksite = {
            name: 'Updated Worksite',
            address: '123 Test St',
            coordinates: { x: 48.8566, y: 2.3522 },
            startDate: '2025-03-05',
            endDate: '2025-04-05',
            status: 'attributed',
            budget: '10000',
            cost: '8000',
            specialities_needed: ['plomberie', 'électricité']
        };

        it('should update an existing worksite', async () => {
            console.log('📝 Testing PUT update worksite');
            // Mock pour vérifier l'existence du chantier
            pool.query.mockResolvedValueOnce([[{ id: '1' }]]);
            // Mock pour la mise à jour
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
            // Mock pour la récupération du chantier mis à jour
            pool.query.mockResolvedValueOnce([[{
                ...mockWorksite,
                id: '1',
                coordinates: { x: '48.8566', y: '2.3522' },
                specialities_needed: 'plomberie, électricité'
            }]]);

            const response = await request(app)
                .put('/api/worksites/1')
                .send(mockWorksite);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Chantier mis à jour avec succès');
            expect(response.body.worksite).toBeDefined();
        });

        it('should return 404 for non-existent worksite', async () => {
            console.log('📝 Testing PUT 404 response');
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app)
                .put('/api/worksites/1')
                .send(mockWorksite);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Chantier non trouvé');
        });

        it('should validate required fields', async () => {
            console.log('📝 Testing PUT validation');
            const invalidWorksite = { name: 'Invalid Worksite' };

            const response = await request(app)
                .put('/api/worksites/1')
                .send(invalidWorksite);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Données manquantes');
            expect(response.body.missingFields).toBeDefined();
        });

        it('should validate coordinates', async () => {
            console.log('📝 Testing PUT coordinates validation');
            const invalidWorksite = {
                ...mockWorksite,
                coordinates: { x: null, y: null }
            };

            const response = await request(app)
                .put('/api/worksites/1')
                .send(invalidWorksite);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Coordonnées invalides');
        });
    });

    describe('DELETE /api/worksites/:id', () => {
        it('should delete an existing worksite', async () => {
            console.log('📝 Testing DELETE worksite');
            // Mock pour vérifier l'existence du chantier
            pool.query.mockResolvedValueOnce([[{ id: '1' }]]);
            // Mock pour la suppression
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .delete('/api/worksites/1');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Chantier supprimé avec succès');
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM worksites WHERE id = ?',
                ['1']
            );
            expect(pool.query).toHaveBeenCalledWith(
                'DELETE FROM worksites WHERE id = ?',
                ['1']
            );
        });

        it('should return 404 for non-existent worksite', async () => {
            console.log('📝 Testing DELETE 404 response');
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app)
                .delete('/api/worksites/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Chantier non trouvé');
        });

        it('should handle database errors', async () => {
            console.log('📝 Testing DELETE error handling');
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .delete('/api/worksites/1');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Erreur serveur');
        });
    });
});
