const db = require("../models");
const controllerProduct = require("../controllers/product.controller");
const {
  sale: Sale,
  user: User,
  product: Product,
  customer: Customer,
  saleProduct: SaleProduct,
} = db;
var { catchErrorNotAuth, catchErrorAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");
exports.add = async (req, res) => {
  try {
    const sale = await Sale.create({
      date: req.body.date,
      total: req.body.total,
      userId: req.userId,
      companyId: req.companyId,
      customerName: req.body.customer.name,
      customerEmail: req.body.customer.email,
      customerPhone: req.body.customer.phone,
      status: 'confirmed'
    });

    const saleProductsPromises = req.body.products.map((saleProduct) => {
      controllerProduct.updateStock(saleProduct.productId, saleProduct.count *(-1));
      return SaleProduct.create({
        saleId: sale.id,
        productId: saleProduct.productId,
        count: saleProduct.count,
      });
    });

    await Promise.all(saleProductsPromises);
    logger.info({
      message: `Sale was created successfully.`,
      sale_id: sale.id,
      company_id: req.companyId,
    });
    res.send({ message: "Sale was added successfully!" });
  } catch (error) {
    console.error(error);
    logger.error({
      message: `An error occurred while creating sale.`,
      customer_name: req.body.customer.name,
      customer_email: req.body.customer.email,
      error_message: error.message,
      error_stack: error.stack,
      error_type: error.name,
    });
    return res.status(500).send({
      message: "Internal server error",
    });
  }
};

exports.addScheduled = async (req, res) => {
  try {
    const sale = await Sale.create({
      date: req.body.date,
      total: req.body.total,
      userId: req.userId,
      companyId: req.companyId,
      status: 'scheduled',
      customerName: req.body.customer.name,
      customerEmail: req.body.customer.email,
      customerPhone: req.body.customer.phone,
    });

    const saleProductsPromises = req.body.products.map((saleProduct) => {
      controllerProduct.updateStock(saleProduct.productId, saleProduct.count *(-1));
      return SaleProduct.create({
        saleId: sale.id,
        productId: saleProduct.productId,
        count: saleProduct.count,
      });
    });

    await Promise.all(saleProductsPromises);
    logger.info({
      message: `Sale scheduled was created successfully.`,
      sale_id: sale.id,
      company_id: req.companyId,
    });
    res.send({ message: "Sale scheduled was added successfully!" });
  } catch (error) {
    console.error(error);
    logger.error({
      message: `An error occurred while creating sale scheduled.`,
      customer_name: req.body.customer.name,
      customer_email: req.body.customer.email,
      error_message: error.message,
      error_stack: error.stack,
      error_type: error.name,
    });
    return res.status(500).send({
      message: "Internal server error",
    });
  }
};

exports.get = async (req, res) => {
  try {
    const sale = await Sale.scope({
      method: ["byCompany", req.companyId],
    }).findByPk(req.query.id);

    if (!sale) {
      logger.error({
        action: "getSale",
        message: `Sale does not exist.`,
        saleId: req.params.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(404).send({
        message: `Failed! Sale Id ${req.params.id} does not exist!`,
      });
    }
    return res.send({ sale });
  } catch (error) {
    return catchErrorAuth(
      "getSale",
      "An error occurred during deletion product.",
      error,
      req,
      res
    );
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.scope({
      method: ["byCompany", req.companyId],
    }).findAll();

    if (sales && sales.length > 0) {
      return res.send({ sales });
    } else {
      logger.error({
        action: "getSales",
        message: `Sales does not exist.`,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(204).send({
        message: `Sale does not exist.`,
      });
    }
  } catch (error) {
    return catchErrorAuth(
      "getSales",
      "An error occurred during deletion product.",
      error,
      req,
      res
    );
  }
};
