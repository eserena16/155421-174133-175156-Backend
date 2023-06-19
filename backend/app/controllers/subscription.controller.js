const db = require("../models");
const Sequelize = require('sequelize');
const sendNotification  = require("../utils/sendNotification");
const config = require("../config/subscription.config");
const { subscription: Subscription, user: User, product: Product } = db;
var { catchErrorNotAuth, catchErrorAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");
exports.add = (req, res) => {
  try {      
    const subscription = Subscription.create({
      userId : req.userId,
      productId : req.body.productId
    }); 
    logger.info({
      action: "registerSubscription",
      message: `Subscription was added successfully.`,
      userId: req.userId,
      productId: req.body.productId,
      subscription: subscription.id,
    });
    return res.send({
      message: "Subscription was added successfully!",
    });    
  } catch(error) {
    return catchErrorNotAuth(
      "registerSubscription",
      "An error occurred during creating subscrption.",
      error,
      req,
      res
    );
  };
};

exports.notificateUser = async (req, subject, text) => {  
  const productsId = req.body.products.map((product) => product.productId);
  console.log("req.body.products" + JSON.stringify(req.body.products));
  try{
    const subscriptions = await Subscription.findAll({
      where: {
        productId: {
          [Sequelize.Op.in]: productsId,
        },
      },
      attributes: ['userId', 'productId'],
      include: [{ 
        model: User,
        as: 'user',
        attributes: ['email', 'name']
      },
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name'] 
      }]
    });    
    if (subscriptions && subscriptions.length > 0) {
      subscriptions.forEach((subscription) => {             
        const message = {
          to: subscription.user.email,
          from: config.from,
          html: text.replace("#nameUser", subscription.user.name)
                    .replace("#product", subscription.product.id + " - " + subscription.product.name),
          subject: subject,
        };
        sendNotification.sendMessage(req, config.hostMQ, config.exchangeMQ, "SUBSCRIPTION", message);
      });      
    } else {
      logger.warn({
        action: "notificateUser",
        message: `No users to notify.`,
        req: req,
        message: message
      });      
    }
  } catch (error) {    
    return catchErrorAuth(
      "notificateUser",
      "An error occurred during notificate user subscription.",
      error,
      req,
      type
    );
  }  
};


exports.getSubscriptions = async (req, res) => {

  try{
    const subscriptions = await Subscription.findAll({
      where: {
        userId: req.userId,
      },
      attributes: ['productId'],
    });
    if (subscriptions && subscriptions.length > 0) {
      return res.send({ subscriptions });
    } else {
      logger.warn({
        action: "getSubscriptions",
        message: `No subscriptions were found.`,
        userId: req.userId        
      });
      return res.status(204).send({
        message: `No subscriptions were found.`,
      });
    }
  } catch (error) {
    return catchErrorAuth(
      "getSubscriptions",
      "An error occurred during get subscriptions.",
      error,
      req,
      res
    );
  }  
};

exports.delete = async (req, res) => {
  try {    
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) {
      logger.error({
        action: "deleteSubscription",
        message: `Subscription does not exist.`,
        userId: req.userId,
        productId: req.body.productId,
      });
      return res.status(404).send({
        message: `Failed! Subscription does not exist!`,
      });
    }else{
      await subscription.destroy();
      logger.info({
        action: "deleteSubscription",
        message: `Subscription was deleted successfully.`,
        invitationId: req.params.id,
      });
      return res.send({
        message: "Subscription deleted successfully!",
      });
    }        
  } catch (error) {
    console.error(error);
    logger.error({
      action: "deleteSubscription",
      message: `An error occurred while deleted subscription.`,
      userId: req.userId,
      productId: req.body.productId,
      errorMessage: error.message,
      errorStack: error.stack,
      errorType: error.name,
    });
    return res.status(500).send({
      message: "Internal server error",
    });
  }
};

