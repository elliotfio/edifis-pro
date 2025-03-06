const request = require("supertest");
const { app, pool } = require("../app");
describe("Tests d'authentification", () => {
    let refreshToken = "";

    test("Connexion avec un utilisateur existant", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "emma.dubois@edifis.fr", password: "admin123" });

        console.log("Réponse reçue :", res.body, "Statut :", res.statusCode);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("access_token");
        expect(res.body).toHaveProperty("refresh_token");

        refreshToken = res.body.refresh_token; 
    });

    test("Génération d'un nouveau token avec le refresh token", async () => {
        const res = await request(app)
            .post("/api/auth/refresh-token")
            .send({ refreshToken });

        console.log("Réponse reçue :", res.body, "Statut :", res.statusCode);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("access_token");
    });

    test("Déconnexion d'un utilisateur", async () => {
        const res = await request(app).post("/api/auth/logout");

        console.log("Réponse reçue :", res.body, "Statut :", res.statusCode);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message");
    });

    afterAll(async () => {
        await pool.end(); 
    });
});
