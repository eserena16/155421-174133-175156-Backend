const db = require("../models");
const controllerProduct = require("../controllers/product.controller");
const {
  purchase: Purchase,
  user: User,
  product: Product,
  supplier: Supplier,
  purchaseProduct: PurchaseProduct,
} = db;
var { catchErrorAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");

exports.add = async (req, res) => {
  try {
    const purchase = await Purchase.create({
      date: req.body.date,
      total: req.body.total,
      supplierId: req.body.supplierId,
      userId: req.userId,
      companyId: req.companyId,
    });

    const purchaseProductsPromises = req.body.products.map(
      (purchaseProduct) => {
        controllerProduct.updateStock(purchaseProduct.productId, purchaseProduct.count);
        return PurchaseProduct.create({
          purchaseId: purchase.id,
          productId: purchaseProduct.productId,
          count: purchaseProduct.count,
        });
      }
    );
    logger.info({
      action: "addPurchase",
      message: `Purchase was added successfully.`,
      purchaseId: purchase.id,
      userId: req.userId,
      companyId: req.companyId,
    });
    await Promise.all(purchaseProductsPromises);

    return res.send({ message: "Purchase was added successfully!" });
  } catch (error) {
    return catchErrorAuth(
      "deleteProduct",
      "An error occurred during deletion product.",
      error,
      req,
      res
    );
  }
};

exports.get = async (req, res) => {
  try {
    const purchase = await Purchase.scope({
      method: ["byCompany", req.companyId],
    }).findByPk(req.params.id);

    if (!purchase) {
      logger.error({
        action: "getPurchase",
        message: `Purchase does not exist.`,
        purchaseId: req.params.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(404).send({
        message: `Failed! Purchase Id ${req.params.id} does not exist!`,
      });
    }
    return res.send({ purchase });
  } catch (error) {
    return catchErrorAuth(
      "deleteProduct",
      "An error occurred during deletion product.",
      error,
      req,
      res
    );
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.scope({
      method: ["byCompany", req.companyId],
    }).findAll();

    if (purchases && purchases.length > 0) {
      return res.send({ purchases });
    } else {
      logger.error({
        action: "getPurchases",
        message: `Purchases does not exist.`,
        purchaseId: req.params.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(204).send({
        message: `Purchases not found.`,
      });
    }
  } catch (error) {
    return catchErrorAuth(
      "deleteProduct",
      "An error occurred during deletion product.",
      error,
      req,
      res
    );
  }
};
