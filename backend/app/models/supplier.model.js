module.exports = (sequelize, Sequelize) => {
  const Supplier = sequelize.define(
    "suppliers",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      phone: {
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

  return Supplier;
};
