const { verifyRegister, authJwt } = require("../middlewares");
const controller = require("../controllers/product.controller");
const verifyProduct = require("../middlewares/verifyProduct");
const upload = require("../utils/multer");
module.exports = function (app) {
  app.post(
    "/api/products",
    upload.single("image"),
    [authJwt.isAdmin, verifyProduct.checkData, verifyProduct.checkDuplicateName],
    controller.add
  );

  app.put(
    "/api/products/:id",
    upload.single("image"),
    [authJwt.isAdmin, verifyProduct.checkData, verifyProduct.checkStatusProduct],
    controller.update
  );

  app.delete(
    "/api/products/:id",
    [authJwt.isAdmin, verifyProduct.checkStatusProduct],
    controller.delete
  );

  app.get(
    "/api/products/:id",
    upload.single("image"),
    [authJwt.isAdmin, verifyProduct.checkProductExisted],
    controller.get
  );

  app.get("/api/products", [], controller.getProducts);
};
