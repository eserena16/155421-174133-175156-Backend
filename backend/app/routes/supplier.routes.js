const { verifyRegister, authJwt } = require("../middlewares");
const controller = require("../controllers/supplier.controller");
const verifySupplier = require("../middlewares/verifySupplier");

module.exports = function (app) {
  app.get(
    "/api/suppliers/:id",
    [authJwt.isAdmin, verifySupplier.checkSupplierExisted],
    controller.get
  );

  app.get("/api/suppliers", [authJwt.isAdmin], controller.getSuppliers);

  app.post(
    "/api/suppliers",
    [
      authJwt.isAdmin,
      verifySupplier.checkData,
      verifySupplier.checkDuplicateName      
    ],
    controller.add
  );

  app.put(
    "/api/suppliers/:id",
    [authJwt.isAdmin, verifySupplier.checkData, verifySupplier.checkSupplierExisted],
    controller.update
  );

  app.delete(
    "/api/suppliers/:id",
    [authJwt.isAdmin, verifySupplier.checkSupplierExisted],
    controller.delete
  );
};
