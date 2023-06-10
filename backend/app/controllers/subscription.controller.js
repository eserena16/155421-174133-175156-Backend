const db = require("../models");
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

exports.delete = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: {
        userId: req.userId,
        productId: req.body.productId,
      },
    });

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

