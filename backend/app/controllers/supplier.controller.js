const db = require("../models");
const { company: Company, supplier: Supplier } = db;

const Op = db.Sequelize.Op;
var { catchErrorAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");
exports.add = async (req, res) => {
  try {
    const supplier = await Supplier.create({
      name: req.body.name,
      address: req.body.address,
      email: req.body.email,
      phone: req.body.phone,
      companyId: req.companyId,
    });
    logger.info({
      action: "addSupplier",
      message: `Product was created successfully.`,
      supplierId: supplier.id,
      userId: req.userId,
      companyId: req.companyId,
    });
    return res.send({
      message: "Supplier was added successfully!",
    });
  } catch (error) {
    return catchErrorAuth(
      "addProduct",
      "An error occurred during creating product.",
      error,
      req,
      res
    );
  }
};

exports.update = async (req, res) => {
  try {
    const supplier = await Supplier.scope({
      method: ["byCompany", req.companyId],
    }).findByPk(req.params.id);

    if (!supplier) {
      logger.error({
        action: "updateSupplier",
        message: `Supplier does not exist.`,
        supplierId: req.params.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(404).send({
        message: `Failed! Supplier Id ${req.params.id} does not exist!`,
      });
    }
    if (supplier.deleted) {
      return res.status(403).send({ message: "Invalid Supplier status!" });
    }
    await supplier.update({
      name: req.body.name,
      address: req.body.address,
      email: req.body.email,
      phone: req.body.phone,
    });
    logger.info({
      action: "updateSupplier",
      message: `Supplier was modified successfully.`,
      supplierId: supplier.id,
      userId: req.userId,
      companyId: req.companyId,
    });
    return res.send({
      message: "Supplier was modified successfully!",
    });
  } catch (error) {
    return catchErrorAuth(
      "updateProduct",
      `An error occurred while modified supplier.`,
      error,
      req,
      res
    );
  }
};

exports.delete = async (req, res) => {
  try {
    const supplier = await Supplier.scope({
      method: ["byCompany", req.companyId],
    }).findByPk(req.params.id);

    if (!supplier) {
      logger.error({
        action: "updateSupplier",
        message: `Supplier does not exist.`,
        supplierId: req.params.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(404).send({
        message: `Failed! Supplier Id ${req.params.id} does not exist!`,
      });
    }

    if (supplier && supplier.deleted) {
      logger.warn({
        action: "deleteSupplier",
        message: `Supplier invalid status.`,
        supplierId: supplier.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      res.status(403).send({
        message: "Invalid Supplier status!",
      });
    }
    await supplier.update({
      deleted: true,
    });
    return res.send({
      message: "Supplier was delete successfully!",
    });
  } catch (error) {
    return catchErrorAuth(
      "deleteProduct",
      `An error occurred while modified supplier.`,
      error,
      req,
      res
    );
  }
};
exports.get = async (req, res) => {
  try {
    const supplier = await Supplier.scope({
      method: ["byCompany", req.companyId],
    }).findByPk(req.params.id);

    if (!supplier) {
      logger.error({
        action: "updateSupplier",
        message: `Supplier does not exist.`,
        supplierId: req.params.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(404).send({
        message: `Failed! Supplier Id ${req.params.id} does not exist!`,
      });
    }
    if (supplier.deleted) {
      logger.warn({
        action: "getSupplier",
        message: `Supplier invalid status.`,
        productId: supplier.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(403).send({ message: "Invalid Supplier status!" });
    }
    return res.send({ supplier });
  } catch (error) {
    return catchErrorAuth(
      "getProduct",
      "An error occurred during deletion product.",
      error,
      req,
      res
    );
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.scope({
      method: ["byCompany", req.companyId],
    }).findAll({
      where: {
        deleted: false,
      },
    });
    if (suppliers && suppliers.length > 0) {
      return res.send({ suppliers });
    } else {
      logger.warn({
        action: "getSuppliers",
        message: `No Suppliers were found.`,
        userId: req.userId,
        companyId: req.companyId,
      });
      res.status(204).send({
        message: `Suppliers not exists!`,
      });
    }
  } catch (error) {
    return catchErrorAuth(
      "refreshToken",
      "An error occurred during refreshing token.",
      error,
      req,
      res
    );
  }
};
