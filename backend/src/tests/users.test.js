jest.mock("../config/db", () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const request = require("supertest");
const express = require("express");
const router = require("../routes/users");
const pool = require("../config/db");

jest.mock("../../generateHash", () =>
  jest.fn().mockResolvedValue("hashedPassword")
);

const app = express();
app.use(express.json());
app.use("/api/users", router);

describe("User Routes", () => {
  let mockConnection;

  beforeEach(() => {
    console.log("🧪 Starting new test...");
    jest.clearAllMocks();

    mockConnection = {
      query: jest.fn().mockResolvedValue([]),
      beginTransaction: jest.fn().mockResolvedValue(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn(),
    };

    pool.getConnection.mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    console.log("✅ Test completed");
  });

  beforeAll(() => {
    console.log("🧪 Starting test suite...");
  });

  afterAll(() => {
    console.log("🧪 All tests completed");
  });

  describe("GET /api/users", () => {
    it("should return all users", async () => {
      console.log("📝 Testing GET all users");
      const mockUsers = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@edifis.fr",
          role: "artisan",
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@edifis.fr",
          role: "chef",
        },
      ];

      pool.query.mockResolvedValueOnce([mockUsers]);

      const response = await request(app).get("/api/users");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT id, firstName, lastName, email, role, date_creation FROM users"
      );
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a specific user with role info - artisan", async () => {
      console.log("📝 Testing GET specific artisan");
      const mockUser = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "artisan",
      };

      const mockArtisanInfo = {
        user_id: 1,
        specialites: JSON.stringify(["plomberie", "électricité"]),
        disponible: true,
      };

      mockConnection.query
        .mockResolvedValueOnce([[mockUser]])
        .mockResolvedValueOnce([[mockArtisanInfo]]);

      const response = await request(app).get("/api/users/1");

      expect(response.status).toBe(200);
    });

    it("should return a specific user with role info - chef", async () => {
      console.log("📝 Testing GET specific chef");
      const mockUser = {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        role: "chef",
      };

      const mockChefInfo = {
        user_id: 2,
        years_experience: 5,
        current_worksite: null,
      };

      mockConnection.query
        .mockResolvedValueOnce([[mockUser]])
        .mockResolvedValueOnce([[mockChefInfo]]);

      const response = await request(app).get("/api/users/2");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUser,
        roleInfo: mockChefInfo,
      });
    });

    it("should return 404 for non-existent user", async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);

      const response = await request(app).get("/api/users/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Utilisateur non trouvé");
    });
  });

  describe("POST /api/users", () => {
    it("should create a new artisan user", async () => {
      const mockUser = {
        firstName: "John",
        lastName: "Doe",
        email: "john@edifis.fr",
        role: "artisan",
        specialites: ["plomberie", "électricité"],
      };

      mockConnection.query
        .mockResolvedValueOnce([{ insertId: 1 }]) // users table insert
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // artisan table insert

      const response = await request(app).post("/api/users").send(mockUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Utilisateur créé avec succès",
        userId: 1,
      });
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();

      // Verify correct SQL parameters
      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO users (firstName, lastName, email, password, role, date_creation) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "John",
          "Doe",
          "john@edifis.fr",
          "hashedPassword",
          "artisan",
          expect.any(String),
        ]
      );
      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO artisan (user_id, specialites, disponible) VALUES (?, ?, true)",
        [1, JSON.stringify(["plomberie", "électricité"])]
      );
    });

    it("should create a new chef user", async () => {
      const mockUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@edifis.fr",
        role: "chef",
        years_experience: "10",
      };

      mockConnection.query
        .mockResolvedValueOnce([{ insertId: 2 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app).post("/api/users").send(mockUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Utilisateur créé avec succès",
        userId: 2,
      });

      // Verify correct SQL parameters
      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO users (firstName, lastName, email, password, role, date_creation) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "Jane",
          "Smith",
          "jane@edifis.fr",
          "hashedPassword",
          "chef",
          expect.any(String),
        ]
      );
      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO chef (user_id, years_experience) VALUES (?, ?)",
        [2, "10"]
      );
    });

    it("should create a new employe user", async () => {
      const mockUser = {
        firstName: "Bob",
        lastName: "Wilson",
        email: "bob@edifis.fr",
        role: "employe",
      };

      mockConnection.query
        .mockResolvedValueOnce([{ insertId: 3 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app).post("/api/users").send(mockUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Utilisateur créé avec succès",
        userId: 3,
      });

      // Verify correct SQL parameters
      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO users (firstName, lastName, email, password, role, date_creation) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "Bob",
          "Wilson",
          "bob@edifis.fr",
          "hashedPassword",
          "employe",
          expect.any(String),
        ]
      );
      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO employe (user_id) VALUES (?)",
        [3]
      );
    });

    it("should handle missing specialites for artisan", async () => {
      const mockUser = {
        firstName: "John",
        lastName: "Doe",
        email: "john@edifis.fr",
        role: "artisan",
      };

      mockConnection.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const response = await request(app).post("/api/users").send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Spécialités requises pour un artisan"
      );
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it("should handle missing years_experience for chef", async () => {
      const mockUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@edifis.fr",
        role: "chef",
      };

      mockConnection.query.mockResolvedValueOnce([{ insertId: 2 }]);

      const response = await request(app).post("/api/users").send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Années d'expérience requises pour un chef"
      );
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it("should handle invalid role", async () => {
      const mockUser = {
        firstName: "Invalid",
        lastName: "User",
        email: "invalid@edifis.fr",
        role: "invalid_role",
      };

      mockConnection.query.mockResolvedValueOnce([{ insertId: 4 }]);

      const response = await request(app).post("/api/users").send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Role invalide");
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update an artisan user", async () => {
      const mockUser = {
        firstName: "John",
        lastName: "Doe",
        email: "john.updated@edifis.fr",
        role: "artisan",
        oldRole: "artisan",
        specialites: ["plomberie"],
      };

      mockConnection.query
        .mockResolvedValueOnce([{ id: 1 }]) // user exists
        .mockResolvedValueOnce([]) // update user
        .mockResolvedValueOnce([]); // update artisan

      const response = await request(app).put("/api/users/1").send(mockUser);

      expect(response.status).toBe(200);
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledWith(
        "UPDATE users SET firstName = ?, lastName = ?, email = ?, role = ?, password = ? WHERE id = ?",
        [
          "John",
          "Doe",
          "john.updated@edifis.fr",
          "artisan",
          "hashedPassword",
          1,
        ]
      );
    });

    it("should update a chef user", async () => {
      const mockUser = {
        firstName: "Jane Updated",
        lastName: "Smith Updated",
        email: "jane.updated@edifis.fr",
        role: "chef",
        oldRole: "chef",
        years_experience: "15",
        password: "newpassword",
      };

      mockConnection.query
        .mockResolvedValueOnce([[{ id: 2, role: "chef" }]]) // Check user exists
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update users table
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Update chef table

      const response = await request(app).put("/api/users/2").send(mockUser);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Utilisateur mis à jour avec succès");
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it("should handle non-existent user", async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);

      const response = await request(app).put("/api/users/999").send({
        firstName: "Updated",
        lastName: "User",
        email: "updated@example.com",
        role: "chef",
        oldRole: "chef",
        years_experience: "10",
        password: "newpassword",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Utilisateur non trouvé");
    }, 10000);
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete an existing user", async () => {
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app).delete("/api/users/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Utilisateur supprimé avec succès",
      });
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();

      // Verify correct SQL parameters
      expect(mockConnection.query).toHaveBeenCalledWith(
        "DELETE FROM users WHERE id = ?",
        ["1"]
      );
    });

    it("should handle non-existent user", async () => {
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const response = await request(app).delete("/api/users/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Utilisateur non trouvé");
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });
});
