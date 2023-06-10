module.exports = (sequelize, Sequelize) => {
    const Purchase = sequelize.define("purchases", {
      id: {      
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: Sequelize.DATE,
      },       
      total: {
        type: Sequelize.INTEGER,
      },  
      deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      scopes: {
        byCompany: function(companyId) {
          return {
            where: {
              companyId: companyId
            }
          }
        }
      }
    }
    );
  
    return Purchase;
  };
  