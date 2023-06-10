module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    "users",
    {
      email: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      name: {
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
  );
};
