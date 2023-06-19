const db = require("../models");
const sendNotification  = require("../utils/sendNotification");
const { invitation: Invitation, user: User, role: Role } = db;
const config = require("../config/invitation.config");
var bcrypt = require("bcryptjs");
var { catchErrorNotAuth, catchErrorAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");
exports.send = async (req, res) => {
  try {
    const { emailTo, role } = req.body;
    const { userId } = req;

    const user = await User.findByPk(userId, {
      include: ["roles", "company"],
    });

    if (user) {
      const invitation = await Invitation.create({
        email: emailTo,
        userId: userId,
        role: role,
        companyId: user.companyId,
      });
      logger.info({
        action: "sendInvitation",
        message: `Invitation created successfully.`,
        invitationId: invitation.id,
        userEmail: user.email,
      });
      const registrationLink = `${config.frontendUrl}/register?invitation=${invitation.id}`;      
      const message = {
        to: emailTo,
        from: config.from,
        html: `<p>Hola,</p>
        <p>Has sido invitado a unirte a nuestra aplicación a la empresa ${user.company.name}. Haz clic en el siguiente enlace para registrarte:</p>
        <p><a href="${registrationLink}">${registrationLink}</a></p>
        <p>Gracias,</p>
        <p>El equipo de nuestra aplicación</p>`,
        subject: config.subject,
      };
      sendNotification.sendMessage(req, config.hostMQhost, config.exchangeMQ, "INVITATION", message);
      res.send({ message: "Invitation register successfully." });      
    }
  } catch (error) {
    return catchErrorAuth(
      "sendInvitation",
      "An error occurred during sending invitation.",
      error,
      req,
      res
    );
  }
};

exports.register = (req, res) => {
  db.sequelize
    .transaction(async (t) => {
      const invitation = await Invitation.findByPk(req.params.id, {
        transaction: t,
      });
      const user = await User.create(
        {
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
          name: req.body.name,
          companyId: invitation.companyId,
        },
        { transaction: t }
      );

      if (user && invitation && invitation.role) {
        const roles = await Role.findAll(
          {
            where: {
              name: invitation.role,
            },
          },
          { transaction: t }
        );

        await user.setRoles(roles, { transaction: t });

        if (invitation) {
          await invitation.update({ status: "accepted" }, { transaction: t });
          logger.info({
            action: "registerInvitation",
            message: `Invitation accepted by user.`,
            userId: user.id,
            invitationId: invitation.id,
          });
        }
      }
      logger.info({
        action: "registerInvitation",
        message: `User was registered successfully from invitation.`,
        userId: user.id,
        userEmail: user.email,
        invitationId: invitation.id,
      });
    })
    .then(() => {
      res.send({ message: "Invitation accepted successfully." });
    })
    .catch((error) => {
      return catchErrorNotAuth(
        "registerInvitation",
        "An error occurred during creating user.",
        error,
        req,
        res
      );
    });
};

exports.reject = async (req, res) => {
  try {
    const invitation = await Invitation.findByPk(req.params.id);

    if (!invitation) {
      logger.error({
        action: "rejectInvitation",
        message: `Invitation does not exist.`,
        invitationId: req.params.id,
      });
      return res.status(404).send({
        message: `Failed! Invitation Id ${req.params.id} does not exist!`,
      });
    }

    await invitation.update({
      status: "rejected",
    });
    logger.info({
      action: "rejectInvitation",
      message: `Invitation was rejected successfully.`,
      invitationId: req.params.id,
    });
    return res.send({
      message: "Invitation rejected successfully!",
    });
  } catch (error) {
    console.error(error);
    logger.error({
      action: "rejectInvitation",
      message: `An error occurred while creating user.`,
      invitationId: req.params.id,
      errorMessage: error.message,
      errorStack: error.stack,
      errorType: error.name,
    });
    return res.status(500).send({
      message: "Internal server error",
    });
  }
};
exports.get = async (req, res) => {
  try {
    const invitation = await Invitation.findByPk(req.params.id);

    if (!invitation) {
      logger.error({
        action: "getInvitation",
        message: `Invitation does not exist.`,
        invitationId: req.params.id,
      });
      return res.status(404).send({
        message: `Failed! Invitation Id ${req.params.id} does not exist!`,
      });
    }
    logger.info({
      action: "getInvitation",
      message: `Invitation was sent successfully.`,
      invitationId: req.params.id,
    });
    return res.send({ invitation });
  } catch (error) {
    console.error(error);
    logger.error({
      action: "getInvitation",
      message: `An error occurred while creating user.`,
      invitationId: req.params.id,
      errorMessage: error.message,
      errorStack: error.stack,
      errorType: error.name,
    });
    return res.status(500).send({
      message: "Internal server error",
    });
  }
};
