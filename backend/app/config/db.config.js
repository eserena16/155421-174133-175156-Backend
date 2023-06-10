const { RDS_USERNAME, RDS_PASSWORD, RDS_HOSTNAME, RDS_PORT, RDS_DB_NAME } = process.env;

module.exports = {
  HOST: RDS_HOSTNAME,
  PORT: RDS_PORT,
  USER: RDS_USERNAME,
  PASSWORD: RDS_PASSWORD,
  DB: RDS_DB_NAME,
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

