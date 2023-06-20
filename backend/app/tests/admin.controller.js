const db = require("../models");
const{ register } = require("../controllers/admin.controller");
const { logger } = require("../utils/logger");
const errorHandler = require("../utils/loggerFunctions");

jest.mock("winston-loggly-bulk", () => ({
  Loggly: jest.fn(() => ({
    log: jest.fn(),
    on: jest.fn(),
  })),
}))


jest.mock("../utils/loggerFunctions", () => ({
  catchErrorNotAuth : jest.fn((action, message, error, req, res) => {
  const { logger } = require("../utils/logger");

  jest.mock("winston-loggly-bulk", () => ({
    Loggly: jest.fn(() => ({
      log: jest.fn(),
      on: jest.fn(),
    })),
  }));

  
  const logObject = {
    action: action,
    message: message,
    errorMessage: error.message,
    errorStack: error.stack,
    errorType: error.name,
  };
  if (req.body.email) {
    logObject.userEmail = req.body.email;
  }

  logger.error(logObject);
  const status = jest.fn().mockReturnThis(); 
  const send = jest.fn();
  return { ...res, status, send }; 
})
}));

  test("register function should create a new company, user, and assign roles if provided", async () => {
    const req = {
      body: {
        companyName: "Test Company",
        email: "test@test.com",
        password: "password",
        name: "Test User",
        roles: ["admin"],
      },
    };
    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    const createCompanySpy = jest.spyOn(db.company, "create").mockResolvedValue({
      id: 1,
      name: "Test Company",
    });
    const createUserSpy = jest.spyOn(db.user, "create").mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "password",
      name: "Test User",
      companyId: 1,
    });

    const loggerSpy = jest.spyOn(logger, "info");
  
    await register(req, res);
  
    expect(createCompanySpy).toHaveBeenCalledWith({ name: "Test Company" });
    expect(createUserSpy).toHaveBeenCalledWith({
      email: "test@test.com",
      password: expect.any(String),
      name: "Test User",
      companyId: 1,
    });
    expect(loggerSpy).toHaveBeenNthCalledWith(1,expect.objectContaining({
      action: "register",
      message: "Company was created successfully.",
      companyId: 1,
      level: "info",
      timestamp: expect.any(String),
    }));
    expect(loggerSpy).toHaveBeenNthCalledWith(2,expect.objectContaining({
      action: "register",
      message: "User was created successfully.",
      userId: 1,
    }));

  
    createCompanySpy.mockRestore();
    createUserSpy.mockRestore();
    loggerSpy.mockRestore();
  });
  
  test("register function should create a new company, user, and assign default role if no roles provided", async () => {
    const req = {
      body: {
        companyName: "Test Company",
        email: "test@test.com",
        password: "password",
        name: "Test User",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const createCompanySpy = jest.spyOn(db.company, "create").mockResolvedValue({
      id: 1,
      name: "Test Company",
    });
    const createUserSpy = jest.spyOn(db.user, "create").mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "password",
      name: "Test User",
      companyId: 1,
    });
    db.user.crearte = jest.fn().mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "password",
      name: "Test User",
      companyId: 1,
    });
    const loggerSpy = jest.spyOn(logger, "info");
  
    await register(req, res);
  
    expect(createCompanySpy).toHaveBeenCalledWith({ name: "Test Company" });
    expect(createUserSpy).toHaveBeenCalledWith({
      email: "test@test.com",
      password: expect.any(String),
      name: "Test User",
      companyId: 1,
    });
    expect(loggerSpy).toHaveBeenNthCalledWith(1,expect.objectContaining({
      action: "register",
      message: "Company was created successfully.",
      companyId: 1,
    }));
    expect(loggerSpy).toHaveBeenNthCalledWith(2,expect.objectContaining({
      action: "register",
      message: "User was created successfully.",
      userId: 1,
    }));
    expect(res.send).toHaveBeenCalledWith({
      message: "User was added successfully!",
    });
  
    createCompanySpy.mockRestore();
    createUserSpy.mockRestore();
    loggerSpy.mockRestore();
  });

  
  test("register function should catch and log errors", async () => {

    jest.mock("../models", () => ({
      company: {
        create: jest.fn().mockRejectedValue(new Error("Test Error")),
      },
      user: {
        create: jest.fn().mockRejectedValue(new Error("Test Error")),
      },
      role: jest.fn(),
    }));
  
    const req = {
      body: {
        companyName: "Test Company",
        email: "test@test.com",
        password: "password",
        name: "Test User",
      },
    };
    const res = {
      status: jest.fn(() => ({
        send: jest.fn(),
      })),
    };
  
    const catchErrorNotAuthSpy = jest.spyOn(errorHandler,"catchErrorNotAuth").mockImplementation((action, message, error, req, res) => {
      logger.error({ action, message });
    });
  
    const loggerSpy = jest.spyOn(logger, "error");
  
    await register(req, res); 
  
    expect(loggerSpy).toHaveBeenCalledWith(expect.objectContaining({
      action: "register",
      level: "error",
      message: "An error occurred during creating user."
    }));
  
    catchErrorNotAuthSpy.mockRestore();
    loggerSpy.mockRestore();
  });
  