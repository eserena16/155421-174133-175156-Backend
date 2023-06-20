const { verifyRegister, authJwt } = require("../middlewares");
const controller = require("../controllers/invitation.controller");
const verifyInvitation = require("../middlewares/verifyInvitation");

module.exports = function (app) {
  app.post(
    "/api/invitation/send",
    [authJwt.isAdmin, verifyInvitation.checkData, verifyInvitation.checkDuplicateInvitation],
    controller.send
  );
  app.put(
    "/api/invitation/reject/:id",
    [verifyInvitation.checkStatusPending],
    controller.reject
  );

  app.get(
    "/api/invitation/:id",
    [verifyInvitation.checkInvitationExisted],
    controller.get
  );

  app.post(
    "/api/invitation/register/:id",
    [
      verifyInvitation.checkStatusPending,
      verifyInvitation.checkDataAccept,
      verifyRegister.checkDuplicateEmail,
      verifyRegister.checkRolesExisted,
      verifyRegister.checkCompanyExisted,
    ],
    controller.register
  );
};
