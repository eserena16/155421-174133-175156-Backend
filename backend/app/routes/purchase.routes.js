const { authJwt } = require("../middlewares");
const controller = require("../controllers/purchase.controller");
const verifyPurchase = require("../middlewares/verifyPurchase");
const verifySupplier = require("../middlewares/verifySupplier");

module.exports = function (app) {
  app.post(
    "/api/purchases",
    [authJwt.isAdmin, verifyPurchase.checkData, verifySupplier.checkStatusSupplier, verifyPurchase.checkProducts],
    controller.add
  );

  app.get("/api/purchases/dashboard", controller.dashboard);

  app.get("/api/purchases/:id", [authJwt.isAdmin], controller.get);

  app.get("/api/purchases", [authJwt.isAdmin], controller.getPurchases);
};
