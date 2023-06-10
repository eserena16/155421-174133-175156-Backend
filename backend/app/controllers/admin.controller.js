const db = require("../models");
const { user: User, role: Role, company: Company } = db;
var bcrypt = require("bcryptjs");

const Op = db.Sequelize.Op;
var { catchErrorNotAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");

exports.register = async (req, res) => {
  try {
    const company = await Company.create({
      name: req.body.companyName,
    });
    logger.info({
      action: "register",
      message: `Company was created successfully.`,
      companyId: company.id,
    });
    const user = await User.create({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      name: req.body.name,
      companyId: company.id,
    });
    logger.info({
      action: "register",
      message: `User was created successfully.`,
      userId: user.id,
    });
    if (user) {
      if (req.body.roles) {
        await Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles,
            },
          },
        }).then((roles) => {
          user.setRoles(roles);
          for (const role of roles) {
            logger.info({
              action: "register",
              message: `Rol assigned successfully.`,
              userId: user.id,
              roleId: role.id,
            });
          }
        });
      } else {
        user.setRoles([1]);
        logger.info({
          action: "register",
          message: `Rol assigned successfully.`,
          userId: user.id,
          roleId: 1,
        });
      }
    }
    return res.send({
      message: "User was added successfully!",
    });
  } catch (error) {
    return catchErrorNotAuth(
      "register",
      "An error occurred during creating user.",
      error,
      req,
      res
    );
  }
};
