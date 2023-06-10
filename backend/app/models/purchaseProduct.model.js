module.exports = (sequelize, Sequelize) => {
    const PurchaseProduct = sequelize.define("purchaseProducts", {
      count: {
        type: Sequelize.INTEGER,
        allowNull: false
      }      
    });
  
    return PurchaseProduct;
  };
  