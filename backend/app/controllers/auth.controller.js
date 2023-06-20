const config = require("../config/auth.config");
const db = require("../models");
const {
  user: User,
  role: Role,
  company: Company,
  refreshToken: RefreshToken,
} = db;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var { catchErrorNotAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");
const Op = db.Sequelize.Op;
exports.login = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then(async (user) => {
      if (!user) {
        logger.error({
          action: "login",
          message: "User not found.",
          userEmail: req.body.email,
        });
        return res.status(404).send({ message: "User not found." });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        logger.error({
          action: "login",
          message: `Invalid password.`,
          userId: user.id,
          userEmail: user.email,
        });
        return res.status(401).send({
          accessToken: null,
          message: "Invalid password.",
        });
      }

      let roles = await user.getRoles();            
      const token = jwt.sign(
        {
          id: user.id,
          companyId: user.companyId,
          role: roles.some((rol) => rol.name === "admin") ? "admin" : "user",
          name: user.name,
          email: user.email,
        },
        config.secret,
        {
          expiresIn: config.jwtExpiration,
        }
      );

      let refreshToken = await RefreshToken.createToken(user);

      logger.info({
        action: "login",
        message: `User logged in successfully.`,
        userId: user.id,
        userEmail: user.email,
      });
      res.status(200).json({
        accessToken: token,
        refreshToken: refreshToken,
      });
    })
    .catch((error) => {
      return catchErrorNotAuth(
        "login",
        "An error occurred during login.",
        error,
        req,
        res
      );
    });
};
exports.logout = (req, res) => {
  const refreshToken = req.body.refreshToken;
  RefreshToken.destroy({ where: { token: refreshToken } })
    .then(() => {
      res.clearCookie("jwt");
      res.status(200).send({ message: "Logout successful" });
    })
    .catch((error) => {
      return catchErrorNotAuth(
        "logout",
        "An error occurred during logout.",
        error,
        req,
        res
      );
    });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    logger.error({
      action: "refreshToken",
      message: `Refresh token is required.`,
    });
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({
      where: { token: requestToken },
    });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.destroy({ where: { id: refreshToken.id } });
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    const user = await refreshToken.getUser();
    let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });
    logger.info({
      action: "refreshToken",
      message: "User refreshed their access token.",
      userId: user.id,
    });
    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (error) {
    return catchErrorNotAuth(
      "refreshToken",
      "An error occurred during refreshing token.",
      error,
      req,
      res
    );
  }
};
