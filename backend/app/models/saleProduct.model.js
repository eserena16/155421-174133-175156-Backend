module.exports = (sequelize, Sequelize) => {
    const SaleProduct = sequelize.define("saleProducts", {
      count: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });  
    return SaleProduct;
  };
  