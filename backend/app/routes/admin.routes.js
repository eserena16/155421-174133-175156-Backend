const { verifyRegister } = require("../middlewares");
const controller = require("../controllers/admin.controller");

module.exports = function (app) {
  app.post(
    "/api/admin/register",
    [
      verifyRegister.checkData,
      verifyRegister.checkDuplicateEmail,
      verifyRegister.checkRolesExisted,
      verifyRegister.checkDuplicateCompany,
    ],
    controller.register
  );
};