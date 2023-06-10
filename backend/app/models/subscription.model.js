module.exports = (sequelize, Sequelize) => {

    const Subscription = sequelize.define('subscriptions', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    });

    return Subscription;
  };
  