const { createLogger, format, transports } = require("winston");
const winston = require("winston");
var { Loggly } = require("winston-loggly-bulk");
const { LOGGLY_HOST, LOGGLY_API_KEY } = process.env;
const logger = winston.createLogger({
  format:
    process.env.NODE_ENV === "production"
      ? format.combine(
          format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
          }),
          format.errors({ stack: true }),
          format.splat(),
          format.json()
        )
      : format.combine(
          format.timestamp(),
          format.printf((info) => {
            const action = info.action ? `[action: ${info.action}] ` : "";
            const userId = info.userId ? `[userId: ${info.userId}] ` : "";
            const companyId = info.companyId
              ? `[companyId: ${info.companyId}] `
              : "";
            const roleId = info.roleId ? `[roleId: ${info.roleId}] ` : "";
            const userEmail = info.userEmail
              ? `[userEmail: ${info.userEmail}] `
              : "";
            const invitationId = info.invitationId
              ? `[invitationId: ${info.invitationId}] `
              : "";
            const productId = info.productId
              ? `[productId: ${info.productId}] `
              : "";
            const saleId = info.saleId ? `[saleId: ${info.saleId}] ` : "";
            const supplierId = info.supplierId
              ? `[supplierId: ${info.supplierId}] `
              : "";
            const date_from = info.date_from
              ? `[date_from: ${info.date_from}] `
              : "";
            const date_to = info.date_to ? `[date_to: ${info.date_to}] ` : "";
            const errorMessage = info.errorMessage
              ? `[errorMessage: ${info.errorMessage}] `
              : "";
            const errorType = info.errorType
              ? `[errorType: ${info.errorType}] `
              : "";
            const errorStack = info.errorStack
              ? `[errorStack: ${info.errorStack}] `
              : "";
            const companyName = info.companyName
              ? `[companyName: ${info.companyName}] `
              : "";
            const supplierName = info.supplierName
              ? `[supplierName: ${info.supplierName}] `
              : "";
            return `[${info.timestamp}] ${info.level}: ${action}${info.message}${userId}${companyId}${companyName}${roleId}${userEmail}${invitationId}${productId} 
            ${saleId}${supplierId}${supplierName}${date_from}${date_to}${errorMessage}${errorType}${errorStack}`;
          })
        ),
  transports: [new winston.transports.Console()],
});
logger.add(
  new Loggly({
    token: LOGGLY_API_KEY,
    subdomain: LOGGLY_HOST,
    tags: ["Obligatorio-ASP"],
    json: true,
  })
);
module.exports.logger = logger;
