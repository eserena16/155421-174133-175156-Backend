const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;
const { TokenExpiredError } = jwt;
var { catchErrorNotAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    logger.error({
      action: "verifyToken",
      message: `Unauthorized! Access Token was expired.`,
    });
    return res
      .status(401)
      .send({ message: "Unauthorized! Access Token was expired." });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
};
isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }
      logger.error({
        action: "isAdminValidation",
        message: `Error validating admin role.`,
        userId: req.userId,
      });
      res.status(403).send({
        message: "Require Admin Role!",
      });
      return;
    });
  });
};

verifyToken = (req, res, next) => {
  try {
    let bearerHeader = req.headers["authorization"];
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, config.secret, (err, decoded) => {
      if (err) {
        return catchError(err, res);
      }
      const userId = decoded.id;
      const companyId = decoded.companyId;
      User.findByPk(userId)
        .then((user) => {
          if (user.companyId !== companyId) {
            return res.status(403).send({ message: "Unauthorized!" });
          }
          req.userId = userId;
          req.user = user;
          req.companyId = companyId;
          next();
        })
        .catch((error) => {
          return catchErrorNotAuth(
            "verifyToken",
            "An error occurred during verification of token.",
            error,
            req,
            res
          );
        });
    });
  } catch (error) {
    logger.error({
      action: "verifyToken",
      message: `Invalid Auth token.`,
    });
    return res.status(401).send({ message: "Invalid Auth token." });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
};
module.exports = authJwt;
