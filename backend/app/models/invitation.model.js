module.exports = (sequelize, Sequelize) => {
  const Invitation = sequelize.define("invitations", {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },    
    role: {
      type: Sequelize.ENUM("admin", "user"),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
  });

  return Invitation;
};
