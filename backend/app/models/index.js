const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  port: config.PORT,
  dialect: config.dialect,  
  logging: false,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,    
    idle: config.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.userRoles = require("../models/userRoles.model.js")(sequelize,Sequelize);
db.company = require("../models/company.model.js")(sequelize, Sequelize);
db.sale = require("../models/sale.model.js")(sequelize, Sequelize);
db.saleProduct = require("../models/saleProduct.model.js")(sequelize,Sequelize);
db.purchase = require("./purchase.model.js")(sequelize, Sequelize);
db.purchaseProduct = require("./purchaseProduct.model.js")(sequelize,Sequelize);
db.supplier = require("../models/supplier.model.js")(sequelize, Sequelize);
db.product = require("../models/product.model.js")(sequelize, Sequelize);
db.invitation = require("../models/invitation.model.js")(sequelize, Sequelize);
db.subscription = require("../models/subscription.model.js")(sequelize, Sequelize);

db.refreshToken = require("../models/refreshToken.model.js")(
  sequelize,
  Sequelize
);

db.role.belongsToMany(db.user, {
  through: "userRoles",
  foreignKey: "roleId",
  otherKey: "userId",
});
db.user.belongsToMany(db.role, {
  through: "userRoles",
  foreignKey: "userId",
  otherKey: "roleId",
});

db.company.hasMany(db.user, { as: "usersCompany" });
db.user.belongsTo(db.company, {
  foreignKey: "companyId",
  as: "company",
  allowNull: false,
});

db.refreshToken.belongsTo(db.user, {
  foreignKey: "userId",
  targetKey: "id",
});
db.user.hasOne(db.refreshToken, {
  foreignKey: "userId",
  targetKey: "id",
});
db.invitation.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
  allowNull: false,
});
db.invitation.belongsTo(db.company, {
  foreignKey: "companyId",
  as: "company",
  allowNull: false,
});

db.supplier.belongsTo(db.company, {
  foreignKey: "companyId",
  as: "company",
  allowNull: false,
});

db.product.belongsTo(db.company, {
  foreignKey: "companyId",
  as: "company",
  allowNull: false,
});

db.purchase.belongsTo(db.supplier, {
  foreignKey: "supplierId",
  as: "supplier",
  allowNull: false,
});
db.purchase.belongsTo(db.company, {
  foreignKey: "companyId",
  as: "company",
  allowNull: false,
});
db.purchase.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
  allowNull: false,
});
db.purchase.belongsToMany(db.product, {
  through: db.purchaseProduct,
  foreignKey: "purchaseId",
  otherKey: "productId",
});


db.sale.belongsTo(db.company, {
  foreignKey: "companyId",
  as: "company",
  allowNull: false,
});
db.sale.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
  allowNull: false,
});
db.sale.belongsToMany(db.product, {
  through: db.saleProduct,
  foreignKey: "saleId",
  otherKey: "productId",
});


db.subscription.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
  allowNull: false,
});

db.subscription.belongsTo(db.product, {
  foreignKey: "productId",
  as: "product",
  allowNull: false,
});

db.ROLES = ["user", "admin"];


module.exports = db;
