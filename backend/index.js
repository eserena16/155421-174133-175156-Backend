require("dotenv").config();
const controller = require("./app/controllers/admin.controller");

const newRelic = require("newrelic");
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcryptjs");
const { URL_FRONT } = process.env;
var corsOptions = {
  origin: "localhost",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

const { company, role, user } = require("./app/models");

if (process.env.NODE_ENV === "production") {
  db.sequelize.sync().then(() => {

  });
} else {
  db.sequelize.sync({ force: true }).then(() => {
    initial();
  });
}

app.get("/", (req, res) => {
  res.json({ message: "Backend app." });
});

const config = require("./app/config/auth.config.js");
const authJwt = require("./app/middlewares/authJwt");

// routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "authorization");
  const currentRoute = req.originalUrl.split("?")[0];
  if (config.excludedRoutes.some(route => new RegExp(`^${route.replace('?', '\\d+')}$`).test(currentRoute))) {
    return next();
  }
  authJwt.verifyToken(req, res, next);
});

require("./app/routes/admin.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/report.routes")(app);
require("./app/routes/invitation.routes")(app);
require("./app/routes/product.routes")(app);
require("./app/routes/supplier.routes")(app);
require("./app/routes/purchase.routes")(app);
require("./app/routes/sale.routes")(app);
require("./app/routes/subscription.routes")(app);
require("./app/routes/healthcheck.routes")(app);

const { logger } = require("./app/utils/logger");
const PORT = process.env.NODE_DOCKER_PORT || 8080;
app.listen(PORT, () => {  
  logger.info({
    action: "serverStart",
    message: `Server is running on port ${PORT}.`,
    tags: ["server", "startup"],
  });
});

async function initial() {
  try
  { 
    
    await role.create({
      id: 1,
      name: "user",
    });
  
    await role.create({
      id: 2,
      name: "admin",
    });

    await company.create({
      name: "ORT",
    });    
        
    const normalUser = {
      name: "Usuario Empleado",
      email: "empleado@ort.com",
      password: bcrypt.hashSync("Password1", 8),      
      companyId: 1,
      userRoles: [1]
    };        
    
    await user.create(normalUser);

    const adminUser = {
      name: "Usuario Administrador",
      email: "admin@ort.com",
      password: bcrypt.hashSync("Password1", 8),          
      companyId: 1,      
      userRoles: [2]
    };
    await user.create(adminUser);

    await db.userRoles.create(
      {
        userId: 1,
        roleId: 1
      });
    await db.userRoles.create(
      {
        userId: 2,
        roleId: 2
      });
    
  }catch(error){    

    logger.error({
      message: `An error occurred while executing initialization.`,      
      error_message: error.message,
      error_stack: error.stack,
    });
  }
}
