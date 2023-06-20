const sendNotification  = require("../utils/sendNotification");
const config = require("../config/api.config");
var { catchErrorAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");


exports.notificatePurchase = async (req, purchase) => {  
  try{
    const message = {
      company: purchase.companyId,
      purchaseDate: purchase.date,
      total: purchase.total,
      supplierId: purchase.suplierId,
      products: req.body.products,
      type: "P"
    };    
    sendNotification.sendMessage(req, config.hostMQ, config.exchangeMQ, "API", message);    
  } catch (error) {    
    return catchErrorAuth(
      "notificatePurchaseAPI",
      "An error occurred during notificate purchase API.",
      error,
      req      
    );
  }  
};

exports.notificateSale = async (req, sale) => {    
  try{    
    const message = { "message" : {
        company: sale.companyId,
        saleDate: sale.date,
        total: sale.total,
        products: req.body.products,
        type: "S"
      }
    };    
    sendNotification.sendMessage(req, config.hostMQ, config.exchangeMQ, "API", message);    
  } catch (error) {    
    return catchErrorAuth(
      "notificatePurchaseAPI",
      "An error occurred during notificate purchase API.",
      error,
      req      
    );
  }  
};


