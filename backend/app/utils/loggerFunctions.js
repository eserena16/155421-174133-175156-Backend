const { logger } = require("../utils/logger");

exports.catchErrorNotAuth = (action, message, error, req, res) => {
  console.error(error);
  const logObject = {
    action: action,
    message: message,
    errorMessage: error.message,
    errorStack: error.stack,
    errorType: error.name,
  };
  if (req.body.email) {
    logObject.userEmail = req.body.email;
  }
  logger.error(logObject);
  return res.status(500).send({
    message: "Internal server error",
  });
};
exports.catchErrorAuth = (action, message, error, req, res) => {
  console.error(error);
  const logObject = {
    action: action,
    message: message,
    errorMessage: error.message,
    errorStack: error.stack,
    errorType: error.name,
    userId: req.userId,
    companyId: req.companyId,
  };
  if (req.body.email) {
    logObject.userEmail = req.body.email;
  }
  logger.error(logObject);
  return res.status(500).send({
    message: "Internal server error",
  });
};
