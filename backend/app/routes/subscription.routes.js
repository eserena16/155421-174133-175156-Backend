const {verifyRegister} = require("../middlewares");
const controller = require("../controllers/subscription.controller");
const verifySubscription = require("../middlewares/verifySubscription");
const verifyProduct = require("../middlewares/verifyProduct");


module.exports = function (app) {
  app.post(
    "/api/subscriptions",
    [verifySubscription.checkDuplicateSubscription, verifyProduct.checkProductExisted],
    controller.add
  );

  app.get(
    "/api/subscriptions",    
    controller.getSubscriptions
  );

  app.delete(
    "/api/subscriptions/:id",
    [verifySubscription.checkSubscriptionExisted],
    controller.delete
  );
};
