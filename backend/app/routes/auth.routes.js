const { verifyRegister } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  app.post("/api/auth/login", controller.login);

  app.post("/api/auth/logout", controller.logout);

  app.post("/api/auth/refreshtoken", controller.refreshToken);
};
