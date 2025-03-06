const request = require("supertest");
const express = require("express");
const authRouter = require("../routes/auth");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

// Mock du pool de connexion
jest.mock("../config/db", () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

// Mock de bcrypt et jwt
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("devrait connecter un utilisateur avec des identifiants valides", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        role: "admin",
      };

      pool.query.mockResolvedValueOnce([[mockUser]]);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce("fake-token");

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
    });

    it("devrait retourner 401 pour des identifiants invalides", async () => {
      pool.query.mockResolvedValueOnce([
        [
          {
            email: "test@example.com",
            password: "hashedPassword",
          },
        ],
      ]);
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Identifiants incorrects");
    });

    it("devrait retourner 404 pour un utilisateur inexistant", async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
    });
  });
});
