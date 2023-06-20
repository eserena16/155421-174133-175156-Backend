const db = require("../models");
const controllerProduct = require("../controllers/product.controller");
const controllerSubscription = require("../controllers/subscription.controller");
const Op = db.Sequelize.Op;

const {
  purchase: Purchase,
  user: User,
  product: Product,
  supplier: Supplier,
  purchaseProduct: PurchaseProduct,
} = db;
var { catchErrorAuth, catchErrorServer } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");
const { json } = require("sequelize");

exports.add = async (req, res) => {
  try {
    const purchase = await Purchase.create({
      date: req.body.date,
      total: req.body.total,
      supplierId: req.body.supplierId,
      userId: req.userId,
      companyId: req.companyId,
    });

    const { date, total, supplierId, companyId, products } = purchase;
    const desiredJson = {
      date,
      total,
      supplier: supplierId,
      company: companyId,
      products
    };
    
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
    const text = `<p>Estimado #nameUser,</p>
        <p>Se ha realizado una compra del producto #product.</p>        
        <p>El equipo de nuestra aplicación</p>`;
    const subject = "Notificación por compra de producto";    
    controllerSubscription.notificateUser(req, subject, text);    
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

exports.dashboard = async (req, res) => {
  try {
    const purchases = await Purchase.scope({
      method: ["byCompany", req.companyId],
    }).findAll({
      where: {
        date: {
          [Op.gte]: req.query.dateFrom,
          [Op.lte]: req.query.dateTo,
        },
      },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'count'],
        },
      ],
      attributes: ['id', 'date', 'supplierId', 'userId'],
    });

    if (purchases && purchases.length > 0) {
      res.send({ purchases });
      logger.info({
        action: "dashboardPurchases",
        message: `Purchases were found successfully.`,
      });
    } else {
      logger.warn({
        action: "dashboardPurchases",
        message: `No purchases were found.`,
        date_from: req.query.dateFrom,
        date_to: req.query.dateTo,
      });
      res.status(200).send({
        message: `No purchases were found.`,
      });
    }
  } catch (error) {
    return catchErrorServer(
      "dashboard",
      "An error occurred during fetching purchases.",
      error,   
      req,
      res         
    );
  }
};
