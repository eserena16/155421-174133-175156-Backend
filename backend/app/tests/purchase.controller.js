const { add } = require("../controllers/purchaseController");
const db = require("../models");

test("add function should create a new purchase and purchase products", async () => {
  const req = {
    body: {
      date: "2022-01-01",
      total: 100,
      supplierId: 1,
      products: [
        { productId: 1, count: 2 },
        { productId: 2, count: 1 },
      ],
    },
    userId: 1,
    companyId: 1,
  };
  const res = {
    send: jest.fn(),
  };
  
  db.purchase.create = jest.fn().mockResolvedValue({ id: 1 });
  db.purchaseProduct.create = jest.fn().mockResolvedValue({ id: 1 });
  
  const logger = {
    info: jest.fn(),
  };

  await add(req, res);
  expect(db.purchase.create).toHaveBeenCalledWith({
    date: "2022-01-01",
    total: 100,
    supplierId: 1,
    userId: 1,
    companyId: 1,
  });
  expect(db.purchaseProduct.create).toHaveBeenCalledWith({
    purchaseId: 1,
    productId: 1,
    count: 2,
  });
  expect(db.purchaseProduct.create).toHaveBeenCalledWith({
    purchaseId: 1,
    productId: 2,
    count: 1,
  });
  expect(logger.info).toHaveBeenCalledWith({
    action: "addPurchase",
    message: `Purchase was added successfully.`,
    purchaseId: 1,
    userId: 1,
    companyId: 1,
  });
  expect(res.send).toHaveBeenCalledWith({
    message: "Purchase was added successfully!",
  });
});

test("get function should return a purchase object if it exists", async () => {
  const req = {
    companyId: 1,
    params: {
      id: 1,
    },
    userId: 1,
  };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };

  db.purchase.create = jest.fn().mockResolvedValue({ id: 1 });
  db.purchase.scope = jest.fn().mockReturnThis();
  db.findByPk = jest.fn().mockResolvedValue({
    id: 1,
    name: "Test Purchase",
    companyId: 1,
  });
  db.purchaseProduct.create = jest.fn().mockResolvedValue({ id: 1 });

  const logger = {
    error: jest.fn(),
  };
  const catchErrorAuth = jest.fn();

  await get(req, res);

  expect(db.purchase.scope).toHaveBeenCalledWith({
    method: ["byCompany", req.companyId],
  });
  expect(db.purchase.findByPk).toHaveBeenCalledWith(req.params.id);
  expect(res.send).toHaveBeenCalledWith({
    purchase: {
      id: 1,
      name: "Test Purchase",
      companyId: 1,
    },
  });
  expect(res.status).not.toHaveBeenCalled();
  expect(logger.error).not.toHaveBeenCalled();
  expect(catchErrorAuth).not.toHaveBeenCalled();
});

test("get function should return a 404 error if purchase does not exist", async () => {
  const req = {
    companyId: 1,
    params: {
      id: 1,
    },
    userId: 1,
  };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  db.purchase.scope = jest.fn().mockReturnThis();
  db.purchase.findByPk = jest.fn().mockResolvedValue(null);

  const logger = {
    error: jest.fn(),
  };
  const catchErrorAuth = jest.fn();

  await get(req, res);

  expect(db.purchase.scope).toHaveBeenCalledWith({
    method: ["byCompany", req.companyId],
  });
  expect(db.purchase.findByPk).toHaveBeenCalledWith(req.params.id);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.send).toHaveBeenCalledWith({
    message: `Failed! Purchase Id ${req.params.id} does not exist!`,
  });
  expect(logger.error).toHaveBeenCalledWith({
    action: "getPurchase",
    message: `Purchase does not exist.`,
    purchaseId: req.params.id,
    userId: req.userId,
    companyId: req.companyId,
  });
  expect(catchErrorAuth).not.toHaveBeenCalled();
});

test("get function should return an error if an error occurs", async () => {
  const req = {
    companyId: 1,
    params: {
      id: 1,
    },
    userId: 1,
  };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };

  db.purchase.scope = jest.fn().mockReturnThis();
  db.purchase.findByPk = jest.fn().mockRejectedValue(new Error("Test Error"));

  const logger = {
    error: jest.fn(),
  };
  const catchErrorAuth = jest.fn();

  await exports.get(req, res, Purchase, logger, catchErrorAuth);

  expect(db.purchase.scope).toHaveBeenCalledWith({
    method: ["byCompany", req.companyId],
  });
  expect(db.purchase.findByPk).toHaveBeenCalledWith(req.params.id);
  expect(res.status).not.toHaveBeenCalled();
  expect(res.send).not.toHaveBeenCalled();
  expect(logger.error).toHaveBeenCalledWith({
    action: "getPurchase",
    message: `An error occurred during deletion product.`,
    error: new Error("Test Error"),
    purchaseId: req.params.id,
    userId: req.userId,
    companyId: req.companyId,
  });
  expect(catchErrorAuth).toHaveBeenCalledWith(
    "deleteProduct",
    "An error occurred during deletion product.",
    new Error("Test Error"),
    req,
    res
  );
});

test("getPurchases returns purchases if they exist", async () => {
  const req = {
    companyId: 1,
  };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  const purchases = [{ id: 1, name: "Product 1" }];

  db.purchase.scope = jest.fn().mockReturnValue({
    findAll: jest.fn().mockResolvedValue(purchases),
  });
  
  await getPurchases(req, res);

  expect(db.purchase.scope).toHaveBeenCalledWith({
    method: ["byCompany", req.companyId],
  });
  expect(res.send).toHaveBeenCalledWith({ purchases });
});

test("getPurchases returns 204 status if purchases do not exist", async () => {
  const req = {
    companyId: 1,
    params: {
      id: 1,
    },
    userId: 1,
  };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  db.purchase.scope = jest.fn().mockReturnValue({
    findAll: jest.fn().mockResolvedValue([]),
  });
  logger.error = jest.fn();

  await getPurchases(req, res);

  expect(db.purchase.scope).toHaveBeenCalledWith({
    method: ["byCompany", req.companyId],
  });
  expect(logger.error).toHaveBeenCalledWith({
    action: "getPurchases",
    message: `Purchases does not exist.`,
    purchaseId: req.params.id,
    userId: req.userId,
    companyId: req.companyId,
  });
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalledWith({
    message: `Purchases not found.`,
  });
});

test("getPurchases returns error if an error occurs", async () => {
  const req = {
    companyId: 1,
  };
  const res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  const error = new Error("An error occurred.");
  db.purchase.scope = jest.fn().mockReturnValue({
    findAll: jest.fn().mockRejectedValue(error),
  });

  catchErrorAuth = jest.fn().mockReturnValue(error);

  await getPurchases(req, res);

  expect(db.purchase.scope).toHaveBeenCalledWith({
    method: ["byCompany", req.companyId],
  });
  expect(catchErrorAuth).toHaveBeenCalledWith(
    "deleteProduct",
    "An error occurred during deletion product.",
    error,
    req,
    res
  );
});