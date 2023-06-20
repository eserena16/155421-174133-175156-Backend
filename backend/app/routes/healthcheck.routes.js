const controller = require("../controllers/healthcheck.controller");

module.exports = function (app) {
  app.get("/api/healthcheck", controller.get);
};
