const db = require("../models");
const { validateEmail } = require("../utils/validation");
const ROLES = db.ROLES;
const Company = db.company;
const User = db.user;
var { logger } = require("../utils/logger");
checkDuplicateEmail = (req, res, next) => {  
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (user) {
      logger.error({
        action: "checkDuplicateEmailRegister",
        message: `Failed! Email is already in use.`,
        userEmail: req.body.email,
      });
      res.status(400).send({
        message: "Failed! Email is already in use!",
      });
      return;
    }
    next();
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        logger.error({
          action: "checkRolesExisted",
          message: `Role does not exist.`,
          roleId: req.body.roles[i],
        });
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`,
        });
        return;
      }
    }
  }
  next();
};

checkDuplicateCompany = (req, res, next) => {
  const companyName = req.body.companyName;
  Company.findOne({ where: { name: companyName } })
    .then((company) => {
      if (company) {
        logger.error({
          action: "checkDuplicateCompany",
          message: `Failed! Company is already in use.`,
          companyName: companyName,
        });
        return res.status(400).send({
          message: `Failed! Company is already in use!`,
        });
      } else {
        next();
      }
    })
    .catch((error) => {
      logger.error({
        action: "checkDuplicateCompany",
        message: `Company does not exist.`,
        companyId: req.params.id,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.name,
      });
      res.status(500).send({
        message: "Failed! Company Id is not valid: " + error.message,
      });
    });
};

checkCompanyExisted = (req, res, next) => {
  const companyId = req.body.companyId;
  Company.findOne({ where: { id: companyId } })
    .then((company) => {
      if (!company) {
        logger.error({
          action: "checkCompanyExisted",
          message: `Company doest not exist.`,
          companyId: companyId,
        });
        return res.status(400).send({
          message: `Failed! Company Id ${companyId} does not exist!`,
        });
      } else {
        next();
      }
    })
    .catch((error) => {
      logger.error({
        action: "checkCompanyExisted",
        message: `Company is not valid.`,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.name,
      });
      res.status(500).send({
        message: "Failed! Company Id is not valid: " + error.message,
      });
      return;
    });
};

checkData = (req, res, next) => {
  const errors = [];

  if (!req.body.name) {
    errors.push("Name is required.");
  } else if (typeof req.body.name !== "string") {
    errors.push("Name is not valid");
  }

  if (!req.body.email) {
    errors.push("Email is required.");
  } else if (typeof req.body.email !== "string") {
    errors.push("Email is not valid.");
  } else {
    if (!validateEmail(req.body.email)) {
      errors.push("Email is not valid!");
    }
  }

  if (!req.body.password) {
    errors.push("Password is required.");
  } else if (typeof req.body.password !== "string") {
    errors.push("Password is not valid.");
  }

  if (!req.body.companyName) {
    errors.push("Company is required.");
  } else if (typeof req.body.companyName !== "string") {
    errors.push("Company Name is not valid.");
  }

  if (!req.body.roles) {
    errors.push("Roles is required.");
  } else if (req.body.roles.length == 0) {
    errors.push("Roles is not valid.");
  }

  if (errors.length > 0) {
    logger.error({
      action: "checkDataRegister",
      message: errors,
    });
    return res.status(400).send({
      message: errors,
    });
  } else {
    next();
  }
};

const verifyRegister = {
  checkDuplicateEmail,
  checkRolesExisted,
  checkCompanyExisted,
  checkDuplicateCompany,
  checkData,
};

module.exports = verifyRegister;
