const db = require("../models");
const Product = db.product;
var { logger } = require("../utils/logger");
checkData = (req, res, next) => {
  const errors = [];

  if (!req.body.date) {
    errors.push("Date is required");
  } else if (typeof req.body.date !== "string") {
    errors.push("Date is not valid");
  } else {
    const fecha = new Date(req.body.date);
    if (isNaN(fecha)) {
      errors.push("Date is not valid");
    }
  }

  if (!req.body.supplierId) {
    errors.push("Supplier is required.");
  } else if (
    typeof req.body.supplierId !== "number" ||
    req.body.supplierId == 0
  ) {
    errors.push("Supplier is not valid.");
  }

  if (!req.body.total) {
    errors.push("Total is required.");
  } else if (typeof req.body.total !== "number" || req.body.total == 0) {
    errors.push("Total is not valid.");
  }

  if (!req.body.products || req.body.products.length == 0) {
    errors.push("Products is required.");
  }

  if (errors.length > 0) {
    logger.error({
      action: "checkDataPurchase",
      message: errors,
    });
    return res.status(400).send({
      message: errors,
    });
  } else {
    next();
  }
};

checkProducts = (req, res, next) => {
  const idElements = req.body.products.map((elemento) => elemento.productId);
  Product.scope({ method: ["byCompany", req.companyId] })
    .findAll({
      where: {
        id: idElements,
        deleted: false,
      },
    })
    .then((products) => {
      if (products && products.length != idElements.length) {
        logger.error({
          action: "checkProductsPurchase",
          message: `There are products that do not exist. List ${idElements}`,
        });
        res.status(400).send({
          message: "Failed! There are products that do not exist!",
        });
        return;
      } else {
        next();
      }
    })
    .catch((error) => {
      logger.error({
        action: "checkProductsPurchase",
        message: `Products are not valid.`,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.name,
      });
      res.status(500).send({
        message: "Failed! Products are not valid: " + error.message,
      });
      return;
    });
};

const verifyPurchase = {
  checkData,
  checkProducts,
};

module.exports = verifyPurchase;
