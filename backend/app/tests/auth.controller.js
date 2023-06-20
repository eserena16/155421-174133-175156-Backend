const { login, logout, refreshToken : RefreshTokenController } = require("../controllers/auth.controller");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
var { catchErrorNotAuth } = require("../utils/loggerFunctions");

const db = require("../models");

const {
  user,
  refreshToken
} = db;

const { logger } = require("../utils/logger");

jest.mock("../utils/loggerFunctions.js", () => ({
  catchErrorNotAuth: jest.fn((action, message, error, req, res) => {
    return res.status(500).send({
      message: "Internal server error",
    });
  }),
}));

jest.mock('winston-loggly-bulk', () => {
  return {
    Loggly: jest.fn().mockImplementation(() => {
      return {
        log: jest.fn(),
        on: jest.fn(),
      };
    }),
  };
});

test("login function should return 404 if user is not found",async () => {
  const req = {
    body: {
      email: "nonexistentuser@example.com",
      password: "password123",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  user.findOne = jest.fn().mockResolvedValue(null);
  await login(req, res);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.send).toHaveBeenCalledWith({ message: "User not found." });
});

test("login function should return access and refresh tokens if login is successful", async () => {
  jest.mock("jsonwebtoken", () => {
    return {
      sign: jest.fn().mockReturnValue("accessToken123"),
    };
  });

  const req = {
    body: {
      email: "existinguser@example.com",
      password: "correctpassword",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const find_user = {
    id: 1,
    email: "existinguser@example.com",
    password: bcrypt.hashSync("correctpassword", 8),
    getRoles: jest.fn().mockResolvedValue(["user"]),
    companyId: 1,
    name: "John Doe",
  };
  user.findOne = jest.fn().mockResolvedValue(find_user);
  refreshToken.createToken = jest.fn().mockResolvedValue("refreshToken123")

  await login(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    accessToken: "accessToken123",
    refreshToken: "refreshToken123",
  });
});

test("login function should return 401 if password is invalid", async () => {
    const req = {
      body: {
        email: "existinguser@example.com",
        password: "wrongpassword",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const find_user = {
      id: 1,
      email: "existinguser@example.com",
      password: bcrypt.hashSync("correctpassword", 8),
      getRoles: jest.fn().mockResolvedValue(["user"]),
    };
    user.findOne = jest.fn().mockResolvedValue(find_user);
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      accessToken: null,
      message: "Invalid password.",
    });
});

test("logout function should clear cookie and send success message", async () => {
  const req = { body: { refreshToken: "testToken" } };
  const res = {
    clearCookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  refreshToken.destroy = jest.fn().mockResolvedValueOnce();
  await logout(req, res);
  expect(refreshToken.destroy).toHaveBeenCalledWith({
    where: { token: "testToken" },
  });
  expect(res.clearCookie).toHaveBeenCalledWith("jwt");
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.send).toHaveBeenCalledWith({ message: "Logout successful" });
});

test("logout function should catch error and call catchErrorNotAuth", async () => {


  const req = { body: { refreshToken: "testToken" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  const error = new Error("test error");
  refreshToken.destroy = jest.fn().mockRejectedValue(error);
  await logout(req, res);
  expect(refreshToken.destroy).toHaveBeenCalledWith({
    where: { token: "testToken" },
  });
  expect(catchErrorNotAuth).toHaveBeenCalledWith(
    "logout",
    "An error occurred during logout.",
    error,
    req,
    res
  );
});
  
test("refreshToken should return an error message if refreshToken is not provided", async () => {
  const req = { body: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  await RefreshTokenController(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ message: "Refresh Token is required!" });
});

test("refreshToken should return an error message if refreshToken is not in database", async () => {
  const req = { body: { refreshToken: "invalidToken" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  refreshToken.findOne = jest.fn().mockResolvedValue(null);
  await RefreshTokenController(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ message: "Refresh token is not in database!" });
});

test("refreshToken should return an error message if refreshToken is expired", async () => {
  const req = { body: { refreshToken: "expiredToken" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const refreshTokenNew = { id: 1 };
  refreshToken.findOne = jest.fn().mockResolvedValue(refreshTokenNew);
  refreshToken.verifyExpiration = jest.fn().mockReturnValue(true);
  refreshToken.destroy = jest.fn();
  await RefreshTokenController(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({
    message: "Refresh token was expired. Please make a new signin request",
  });
});

test("refreshToken should return a new accessToken and refreshToken", async () => {
  const req = { body: { refreshToken: "validToken" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const user = { id: 1 };
  const refreshTokenNew = { id: 1, token: "validToken", getUser: jest.fn().mockResolvedValue(user) };
  refreshToken.findOne = jest.fn().mockResolvedValue(refreshTokenNew);
  refreshToken.verifyExpiration = jest.fn().mockReturnValue(false);
  jwt.sign = jest.fn().mockReturnValue("newAccessToken");
  await RefreshTokenController(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    accessToken: "newAccessToken",
    refreshToken: refreshTokenNew.token,
  });
});