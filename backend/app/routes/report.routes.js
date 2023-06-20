const { authJwt } = require("../middlewares");
const controller = require("../controllers/report.controller");

module.exports = function (app) {
  app.get("/api/reports/send", [authJwt.isAdmin], controller.send);
};
