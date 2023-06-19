const db = require("../models");
const Subscription = db.subscription;
var { logger } = require("../utils/logger");
checkDuplicateSubscription = (req, res, next) => {
  Subscription.findOne({
    where: {
      userId: req.userId,
      productId: req.body.productId,
    },
  }).then((subscription) => {
    if (subscription) {
      logger.error({
        action: "checkDuplicateSubscription",
        message: `Failed! User already subscribed to product.`,
        userId: req.userId,
        productId: req.productId,
      });
      res.status(400).send({
        message: "Failed! User already subscribed to product!",
      });
      return;
    } else {
      next();
    }
  });
};

checkSubscriptionExisted = (req, res, next) => {
  Subscription.findByPk(
    req.params.id
  ).then((subscription) => {
      if (!subscription) {
        logger.error({
          action: "checkSubscriptionExisted",
          message: `Subscription does not exist.`,
          userId: req.userId,
          productId: req.productId,
        });
        return res.status(400).send({
          message: `Failed! Subscription does not exist!`,
        });
      } else {
        next();
      }
    })
    .catch((error) => {
      logger.error({
        action: "checkSubscriptionExisted",
        message: `Subscription does not exist.`,
        userId: req.userId,
        productId: req.productId,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.name,
      });
      res.status(500).send({
        message: "Failed! Subscription is not valid: " + error.message,
      });
      return;
    });
};

const verifySubscription = {
  checkDuplicateSubscription,
  checkSubscriptionExisted  
};

module.exports = verifySubscription;
