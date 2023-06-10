module.exports = {
  secret: "secret-key-ASP",
  jwtExpiration: 3600, // 1 hora
  jwtRefreshExpiration: 86400, // 24 horas
  excludedRoutes: [
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/refreshtoken",
    "/api/admin/register",
    "/api/invitation/?",
    "/api/invitation/register/?",
    "/api/healthcheck",
  ],
};
