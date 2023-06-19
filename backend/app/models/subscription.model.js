module.exports = (sequelize, Sequelize) => {

    const Subscription = sequelize.define('subscriptions', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    });

    Subscription.associate = (models) => {
        Subscription.belongsToMany(models.User, { foreignKey: 'userId', as: "users" });
        Subscription.belongsToMany(models.Product, { foreignKey: 'productId', as: "products" });
      };

    return Subscription;
  };
  