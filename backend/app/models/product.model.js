module.exports = (sequelize, Sequelize) => {
  return (Product = sequelize.define(
    "products",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      count: {
        type: Sequelize.INTEGER,
      },
      image: {
        type: Sequelize.STRING,
      },
      cloudinary_id: {
        type: Sequelize.STRING,
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      scopes: {
        byCompany: function (companyId) {
          return {
            where: {
              companyId: companyId,
            },
          };
        },
      },
    }
  ));
};
