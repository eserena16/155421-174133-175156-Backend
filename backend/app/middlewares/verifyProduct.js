const db = require("../models");
var { logger } = require("../utils/logger");
const Product = db.product;
var { logger } = require("../utils/logger");
checkDuplicateName = (req, res, next) => {
  Product.scope({ method: ["byCompany", req.companyId] })
    .findOne({
      where: {
        name: req.body.name,
      },
    })
    .then((product) => {
      if (product) {
        logger.error({
          action: "checkDuplicateName",
          message: `Failed! Product is already in use.`,
          userEmail: req.body.emailTo,
        });
        res.status(400).send({
          message: "Failed! Product is already in use!",
        });
        return;
      } else {
        next();
      }
    });
};

checkStatusProduct = (req, res, next) => {
  Product.scope({ method: ["byCompany", req.companyId] })
    .findByPk(req.params.id)
    .then((product) => {
      if (!product) {
        logger.error({
          action: "checkStatusProduct",
          message: `Product does not exist.`,
          productId: req.params.id,
        });
        return res.status(400).send({
          message: `Failed! Product Id ${req.params.id} does not exist!`,
        });
      } else {
        if (product && product.deleted) {
          logger.error({
            action: "checkStatusProduct",
            message: `Product deleted status.`,
            productId: req.params.id,
          });
          return res.status(400).send({
            message: `Failed! Invalid removed product!`,
          });
        } else {
          next();
        }
      }
    })
    .catch((error) => {
      logger.error({
        action: "checkStatusProduct",
        message: `Product does not exist.`,
        productId: req.params.id,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.name,
      });
      res.status(500).send({
        message: "Failed! Product Id is not valid: " + error.message,
      });
      return;
    });
};

checkProductExisted = (req, res, next) => {
  const productId = req.params.id ?? req.body.productId;
  Product.scope({ method: ["byCompany", req.companyId] })
    .findByPk(productId)
    .then((product) => {
      if (!product) {
        logger.error({
          action: "checkProductExisted",
          message: `Product does not exist.`,
          productId: productId,
        });
        return res.status(400).send({
          message: `Failed! Product Id ${productId} does not exist!`,
        });
      } else {
        next();
      }
    })
    .catch((error) => {
      logger.error({
        action: "checkProductExisted",
        message: `Product does not exist.`,
        productId: productId,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.name,
      });
      res.status(500).send({
        message: "Failed! Product Id is not valid: " + error.message,
      });
      return;
    });
};

checkData = (req, res, next) => {
  const errors = [];

  if (!req.body.name) {
    errors.push("Name is required.");
  } else if (typeof req.body.name !== "string") {
    errors.push("Name is not valid");
  }

  if (!req.body.description) {
    errors.push("Description is required.");
  } else if (typeof req.body.description !== "string") {
    errors.push("Description is not valid.");
  }

  if (!req.body.price) {
    errors.push("Price is required.");
  } else if (
    typeof req.body.price !== "number" &&
    typeof req.body.price !== "string" &&
    req.body.price < 0
  ) {
    errors.push("Price is not valid");
  }

  if (!req.body.count) {
    errors.push("Count is required.");
  } else if (
    typeof req.body.count !== "number" &&
    typeof req.body.price !== "string" &&
    req.body.count < 0
  ) {
    errors.push("Count is not valid.");
  }

  if (!req.file) {
    errors.push("File is required.");
  } else if (!req.file.path) {
    errors.push("Count is required.");
  }

  if (errors.length > 0) {
    logger.error({
      action: "checkDataProduct",
      message: errors,
    });
    return res.status(400).send({
      message: errors,
    });
  } else {
    next();
  }
};

const verifyProduct = {
  checkDuplicateName,
  checkProductExisted,
  checkStatusProduct,
  checkData,
};

module.exports = verifyProduct;
