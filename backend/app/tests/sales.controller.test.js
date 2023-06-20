const db = require("../models");
const { add } = require("../controllers/sales.controller");

test("adds a sale successfully", async () => {
  const req = {
    body: {
      date: "2022-01-01",
      total: 100,
      customer: {
        name: "John Doe",
        email: "johndoe@example.com",
        phone: "1234567890",
      },
      products: [
        {
          productId: 1,
          count: 2,
        },
        {
          productId: 2,
          count: 1,
        },
      ],
    },
    userId: 1,
    companyId: 1,
  };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };

  db.sale.create = jest.fn().mockResolvedValue({ id: 1 });
  db.saleProduct.create = jest.fn().mockResolvedValue({ id: 1 });

  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };
  await add(req, res);
  expect(db.sale.create).toHaveBeenCalledWith({
    date: "2022-01-01",
    total: 100,
    userId: 1,
    companyId: 1,
    customerName: "John Doe",
    customerEmail: "johndoe@example.com",
    customerPhone: "1234567890",
  });
  expect(db.saleProduct.create).toHaveBeenCalledWith({
    saleId: 1,
    productId: 1,
    count: 2,
  });
  expect(db.saleProduct.create).toHaveBeenCalledWith({
    saleId: 1,
    productId: 2,
    count: 1,
  });
  expect(logger.info).toHaveBeenCalledWith({
    message: "Sale was created successfully.",
    sale_id: 1,
    company_id: 1,
  });
  expect(res.send).toHaveBeenCalledWith({
    message: "Sale was added successfully!",
  });
});

test("returns 500 if an error occurs", async () => {
  const req = {
    body: {
      customer: {
        name: "John Doe",
        email: "johndoe@example.com",
      },
    },
    userId: 1,
    companyId: 1,
  };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };

  db.sale.create = jest.fn().mockRejectedValue(new Error("Database error"));
  db.saleProduct.create = jest.fn().mockResolvedValue({ id: 1 });

  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };
  
  await add(req, res);

  expect(logger.error).toHaveBeenCalledWith({
    message: "An error occurred while creating sale.",
    customer_name: "John Doe",
    customer_email: "johndoe@example.com",
    error_message: "Database error",
    error_stack: expect.any(String),
    error_type: "Error",
  });
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith({
    message: "Internal server error",
  });
});

test("get function should return sale object if it exists", async () => {
  const req = {
    companyId: 1,
    query: {
      id: 1,
    },
  };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  const sale = {
    id: 1,
    name: "Test Sale",
    companyId: 1,
  };
  Sale.scope = jest.fn().mockReturnThis();
  Sale.scope().findByPk = jest.fn().mockResolvedValue(sale);

  await get(req, res);

  expect(res.send).toHaveBeenCalledWith({ sale });
});

test("get function should return 404 if sale does not exist", async () => {
  const req = {
    companyId: 1,
    query: {
      id: 1,
    },
    params: {
      id: 1,
    },
    userId: 1,
  };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  db.sale.scope = jest.fn().mockReturnThis();
  db.sale.findByPk = jest.fn().mockResolvedValue(null);
  logger.error = jest.fn();

  await get(req, res);

  expect(logger.error).toHaveBeenCalledWith({
    action: "getSale",
    message: `Sale does not exist.`,
    saleId: req.params.id,
    userId: req.userId,
    companyId: req.companyId,
  });
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.send).toHaveBeenCalledWith({
    message: `Failed! Sale Id ${req.params.id} does not exist!`,
  });
});

test("get function should return error if an error occurs", async () => {
  const req = {
    companyId: 1,
    query: {
      id: 1,
    },
  };
  const res = {
    send: jest.fn(),
  };
  const error = new Error("Test Error");
  db.sale.scope = jest.fn().mockReturnThis();
  db.sale.findByPk = jest.fn().mockRejectedValue(error);
  catchErrorAuth = jest.fn();

  await get(req, res);

  expect(catchErrorAuth).toHaveBeenCalledWith(
    "getSale",
    "An error occurred during deletion product.",
    error,
    req,
    res
  );
});

test("getSales returns sales if they exist", async () => {
  const req = { companyId: 1, userId: 1 };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  const sales = [{ id: 1, name: "Sale 1" }, { id: 2, name: "Sale 2" }];
  db.sale.scope = jest.fn().mockReturnValue({
    findAll: jest.fn().mockResolvedValue(sales),
  });

  await getSales(req, res);

  expect(db.sale.scope).toHaveBeenCalledWith({
    method: ["byCompany", req.companyId],
  });
  expect(res.send).toHaveBeenCalledWith({ sales });
  expect(res.status).not.toHaveBeenCalled();
});

test("getSales returns 204 if sales do not exist", async () => {
  const req = { companyId: 1, userId: 1 };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  db.sale.scope = jest.fn().mockReturnValue({
    findAll: jest.fn().mockResolvedValue([]),
  });

  await getSales(req, res);

  expect(db.sale.scope).toHaveBeenCalledWith({
    method: ["byCompany", req.companyId],
  });
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalledWith({ message: "Sale does not exist." });
});

test("getSales returns error if an error occurs", async () => {
  const req = { companyId: 1, userId: 1 };
  const res = {};
  const error = new Error("An error occurred.");
  db.sale.scope = jest.fn().mockReturnValue({
    findAll: jest.fn().mockRejectedValue(error),
  });
  catchErrorAuth = jest.fn();

  await getSales(req, res);

  expect(db.sale.scope).toHaveBeenCalledWith({
    method: ["byCompany", req.companyId],
  });
  expect(catchErrorAuth).toHaveBeenCalledWith(
    "getSales",
    "An error occurred during deletion product.",
    error,
    req,
    res
  );
});