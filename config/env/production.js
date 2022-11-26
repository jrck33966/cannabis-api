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
    pathTmp: process.env.PATHTEP,
    pathItem: process.env.PATHITEM,
  },
  admin: {
    username: process.env.USERNAME_ADMIN,
    password: process.env.PASSWORD_ADMIN
  },
  jwtSecret: process.env.JWTSECRET,
  jwtSecretAdmin: process.env.JWTSECRETADMIN,
  jwtRefreshSecretAdmin: process.env.JWTREFRESHSECRETADMIN,
  secretHash: process.env.SECRETHASH
};


module.exports = config;
