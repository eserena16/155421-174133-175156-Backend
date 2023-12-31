const db = require("../models");
const controllerProduct = require("../controllers/product.controller");
const controllerSubscription = require("../controllers/subscription.controller");
const controllerApi = require("../controllers/api.controller");
const Op = db.Sequelize.Op;

const {
  sale: Sale,
  user: User,
  product: Product,
  customer: Customer,
  saleProduct: SaleProduct,
} = db;
var { catchErrorAuth, catchErrorServer } = require("../utils/loggerFunctions");
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

    const text = `<p>Estimado #nameUser,</p>
        <p>Se ha realizado una venta del producto #product.</p>        
        <p>El equipo de nuestra aplicación</p>`;
    const subject = "Notificación por venta de producto";    
    controllerSubscription.notificateUser(req, subject, text);
    logger.info({
      message: `Sale was created successfully.`,
      sale_id: sale.id,
      company_id: req.companyId,
    });
    await Promise.all(saleProductsPromises);
    controllerApi.notificateSale(req, sale);
    res.send({ message: "Sale was added successfully!" });
  } catch (error) {    
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

exports.dashboard = async (req, res) => {
  try {
    const sales = await Sale.scope({
      method: ["byCompany", req.companyId],
    }).findAll({
      where: {
        date: {
          [Op.gte]: req.query.dateFrom,
          [Op.lte]: req.query.dateTo,
        },
        status: "confirmed"
      },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'count'],
        },
      ],
      attributes: ['id', 'date', 'userId'],
    });

    if (sales && sales.length > 0) {
      res.send({ sales });
      logger.info({
        action: "dashboardSale",
        message: `Sales were found successfully.`,
      });
    } else {
      logger.warn({
        action: "dashboardSale",
        message: `No sales were found.`,
        date_from: req.query.dateFrom,
        date_to: req.query.dateTo,
      });
      res.status(200).send({
        message: `No sales were found.`,
      });
    }
  } catch (error) {
    return catchErrorServer(
      "dashboard",
      "An error occurred during fetching sales.",
      error,
      req,
      res
    );
  }
};
