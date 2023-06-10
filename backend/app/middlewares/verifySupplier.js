const db = require("../models");
const { validateEmail } = require("../utils/validation");
const Supplier = db.supplier;
var { logger } = require("../utils/logger");
checkDuplicateName = (req, res, next) => {  
  Supplier.scope({ method: ["byCompany", req.companyId] })
    .findOne({
      where: {
        name: req.body.name,
      },
    })
    .then((supplier) => {
      if (supplier) {
        logger.error({
          action: "checkDuplicateNameSupplier",
          message: `Supplier is already in use.`,
          supplierName: req.body.name,
        });
        res.status(400).send({
          message: "Failed! Supplier is already in use!",
        });
        return;
      } else {
        next();
      }
    });
};

checkSupplierExisted = (req, res, next) => {
  Supplier.scope({ method: ["byCompany", req.companyId] })
    .findByPk(req.params.id)
    .then((supplier) => {
      if (!supplier) {
        logger.error({
          action: "checkSupplierExisted",
          message: `Supplier does not exist.`,
          supplierId: req.params.id,
        });
        return res.status(400).send({
          message: `Failed! Supplier Id ${req.params.id} does not exist!`,
        });
      } else {
        next();
      }
    })
    .catch((error) => {
      logger.error({
        action: "checkSupplierExisted",
        message: `Supplier does not exist.`,
        supplierId: req.params.id,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.name,
      });
      res.status(500).send({
        message: "Failed! Supplier Id is not valid: " + error.message,
      });
      return;
    });
};

checkStatusSupplier = (req, res, next) => {
  Supplier.scope({ method: ["byCompany", req.companyId] })
    .findByPk(req.body.supplierId)
    .then((supplier) => {
      if (!supplier) {
        return res.status(400).send({
          message: `Failed! Supplier Id ${req.body.supplierId} does not exist!`,
        });
      } else {
        if (supplier && supplier.deleted) {
          return res.status(400).send({
            message: `Failed! Invalid status Supplier!`,
          });
        } else {
          next();
        }
      }
    })
    .catch((error) => {
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

  if (!req.body.address) {
    errors.push("Address is required.");
  } else if (typeof req.body.address !== "string") {
    errors.push("Address is not valid.");
  }

  if (!req.body.email) {
    errors.push("Email is required.");
  } else if (typeof req.body.email !== "string") {
    errors.push("Email is not valid.");
  } else {
    if (!validateEmail(req.body.email)) {
      errors.push("Email is not valid!");
    }
  }

  if (!req.body.phone) {
    errors.push("Phone is required.");
  } else if (typeof req.body.phone !== "string") {
    errors.push("Phone is not valid.");
  }

  if (errors.length > 0) {
    logger.error({
      action: "checkDataSupplier",
      message: errors,
    });
    return res.status(400).send({
      message: errors,
    });
  } else {
    next();
  }
};

const verifySupplier = {
  checkDuplicateName,
  checkSupplierExisted,
  checkData,
  checkStatusSupplier,
};

module.exports = verifySupplier;
