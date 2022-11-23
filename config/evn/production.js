const config = {
    app: {
      port: process.env.PORT
    },
    db: {
      host: process.env.HOST_DB,
      port: process.env.PORT_DB,
      username: process.env.USERNAME_DB,
      password: process.env.PASSWORD_DB,
      name: process.env.NAME_DB,
      prefix: process.env.PREFIX_DB
    },
    pathImg: {
      pathTmp: "../upload/tmp",
      pathItem: "../../upload/img-items",
    },
    admin: {
      username: process.env.USERNAME_ADMIN,
      password: process.env.PASSWORD_ADMIN
    },
    jwtSecret: "cain-api-dev",
    jwtSecretAdmin: "cain-api-admin",
    jwtRefreshSecretAdmin: "cain-api-refresh-admin",
    secretHash: "cain-hash-token-id"
  };
  
  
  module.exports = config;
  