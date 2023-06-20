const controller = require("../controllers/sale.controller");
const verifySale = require("../middlewares/verifySale");

module.exports = function (app) {
  app.post(
    "/api/sales",
    [verifySale.checkData, verifySale.checkProducts],
    controller.add
  );

  app.post(
    "/api/sales/scheduled",
    [verifySale.checkData, verifySale.checkProducts],
    controller.addScheduled
  );

  app.get("/api/sales/dashboard", [], controller.dashboard);

  app.get("/api/sales/:id", [], controller.get);

  app.get("/api/sales", [], controller.getSales);
};
