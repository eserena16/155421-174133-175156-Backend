const db = require("../models");
const Invitation = db.invitation;
const { validateEmail } = require("../utils/validation");
var { logger } = require("../utils/logger");
checkDuplicateInvitation = (req, res, next) => {
  Invitation.findOne({
    where: {
      email: req.body.emailTo,
      status: "pending",
    },
  }).then((invitation) => {
    if (invitation) {
      logger.error({
        action: "checkDuplicateInvitation",
        message: `Failed! User has pending invitation.`,
        userEmail: req.body.emailTo,
      });
      res.status(400).send({
        message: "Failed! User has pending invitation!",
      });
      return;
    } else {
      next();
    }
  });
};

checkInvitationExisted = (req, res, next) => {
  Invitation.findByPk(req.params.id)
    .then((invitation) => {
      if (!invitation) {
        logger.error({
          action: "checkInvitationExisted",
          message: `Invitation does not exist.`,
          invitationId: req.params.id,
        });
        return res.status(400).send({
          message: `Failed! Invitation Id ${req.params.id} does not exist!`,
        });
      } else {
        next();
      }
    })
    .catch((error) => {
      logger.error({
        action: "checkInvitationExisted",
        message: `Invitation does not exist.`,
        invitationId: req.params.id,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.name,
      });
      res.status(500).send({
        message: "Failed! Invitation Id is not valid: " + error.message,
      });
      return;
    });
};

checkStatusPending = (req, res, next) => {
  Invitation.findByPk(req.params.id)
    .then((invitation) => {
      if (!invitation) {
        logger.error({
          action: "checkStatusPending",
          message: `Invitation does not exist.`,
          invitationId: req.params.id,
        });
        return res.status(400).send({
          message: `Failed! Invitation Id ${req.params.id} does not exist!`,
        });
      } else {
        if (invitation && invitation.status != "pending") {
          logger.error({
            action: "checkStatusPending",
            message: `Invitation invalid status.`,
            invitationId: req.params.id,
          });
          return res.status(400).send({
            message: `Failed! Invalid invitation status!`,
          });
        } else {
          if (invitation && invitation.companyId != req.body.companyId) {
            logger.error({
              action: "checkStatusPending",
              message: `Invitation invalid company Id.`,
              invitationId: req.params.id,
            });
            return res.status(400).send({
              message: `Failed! Invitation invalid company Id!`,
            });
          } else {
            next();
          }
        }
      }
    })
    .catch((error) => {
      logger.error({
        action: "checkStatusPending",
        message: `Invitation does not exist.`,
        invitationId: req.params.id,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.name,
      });
      res.status(500).send({
        message: "Failed! Invitation Id is not valid: " + error.message,
      });
      return;
    });
};

checkData = (req, res, next) => {
  const errors = [];

  if (!req.body.emailTo) {
    errors.push("Email is required.");
  } else if (typeof req.body.emailTo !== "string") {
    errors.push("Email is not valid");
  } else {
    if (!validateEmail(req.body.emailTo)) {
      errors.push("Email is not valid!");
    }
  }

  if (!req.body.role) {
    errors.push("Role is required.");
  } else if (typeof req.body.role !== "string") {
    errors.push("Role is not valid.");
  }

  if (errors.length > 0) {
    logger.error({
      action: "checkDataInvitation",
      message: errors,
    });
    return res.status(400).send({
      message: errors,
    });
  } else {
    next();
  }
};

checkDataAccept = (req, res, next) => {
  const errors = [];

  if (!req.params.id || req.params.id == 0) {
    errors.push("Invitation id is not valid");
  }

  if (!req.body.name || typeof req.body.name !== "string") {
    errors.push("Name is not valid");
  }

  if (!req.body.email || typeof req.body.email !== "string") {
    errors.push("Email is not valid");
  } else {
    if (!validateEmail(req.body.email)) {
      errors.push("Email is not valid!");
    }
  }

  if (!req.body.password || typeof req.body.password !== "string") {
    errors.push("Password is not valid.");
  }

  if (!req.body.companyId || typeof req.body.companyId !== "number") {
    errors.push("Company is not valid.");
  }

  if (errors.length > 0) {
    logger.error({
      action: "checkDataAcceptInvitation",
      message: errors,
    });
    return res.status(400).send({
      message: errors,
    });
  } else {
    next();
  }
};

const verifyInvitation = {
  checkDuplicateInvitation,
  checkInvitationExisted,
  checkStatusPending,
  checkData,
  checkDataAccept,
};

module.exports = verifyInvitation;
