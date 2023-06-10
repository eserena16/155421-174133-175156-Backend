module.exports = (sequelize, Sequelize) => {
    const Sale = sequelize.define("sales", {
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
      status: {
        type: Sequelize.ENUM('confirmed', 'scheduled'),
      },      
      customerName: {
        type: Sequelize.STRING,
      },
      customerEmail: {
        type: Sequelize.STRING,
      },
      customerPhone: {
        type: Sequelize.STRING,
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
  
    return Sale;
  };
  