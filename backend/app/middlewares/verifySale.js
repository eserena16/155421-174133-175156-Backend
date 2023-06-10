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
    const hoy = new Date(req.body.date);
    if (isNaN(fecha)) {
      errors.push("Date is not valid");
    }else{
      if(fecha < hoy){
        errors.push("The date is greater than today");
      }
    }
  }
  if (!req.body.customer) {
    errors.push("Customer is required.");
  } else {
    if (!req.body.customer.name) {
      errors.push("Customer name is required.");
    }
    if (!req.body.customer.email) {
      errors.push("Customer email is required.");
    }
    if (!req.body.customer.phone) {
      errors.push("Customer phone is required.");
    }
  }

  if (!req.body.total) {
    errors.push("Total is required");
  } else if (typeof req.body.total !== "number" || req.body.total == 0) {
    errors.push("Total is not valid.");
  }

  if (!req.body.products || req.body.products.length == 0) {
    errors.push("Products is required.");
  }

  if (errors.length > 0) {
    logger.error({
      action: "checkDataSale",
      message: errors,
    });
    res.status(400).send({
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
          action: "checkProductsSale",
          message: `There are products that do not exist. List ${idElements}`,
        });
        return res.status(400).send({
          message: "Failed! There are products that do not exist!",
        });
      } else {
        const insufficientStockProducts = [];
        products.forEach((saleProduct) => {
          const product = req.body.products.find(
            (p) => p.productId === saleProduct.id
          );
          if (product.count > saleProduct.count) {
            insufficientStockProducts.push(saleProduct.name);
          }
        });
        if (insufficientStockProducts.length > 0) {
          logger.error({
            action: "checkProductsSale",
            message: `The following products do not have enough stock. List ${insufficientStockProducts.join(
              ", "
            )}`,
          });
          return res.status(400).send({
            message: `Failed! The following products do not have enough stock: ${insufficientStockProducts.join(
              ", "
            )}`,
          });
        }
        next();
      }
    })
    .catch((error) => {
      logger.error({
        action: "checkProductsSale",
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

const verifySale = {
  checkData,
  checkProducts,
};

module.exports = verifySale;
