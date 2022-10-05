const config = {
    app: {
      port: 3000
    },
    db: {
      host: 'localhost',
      port: 27017,
      username: 'cannabis',
      password: 'cannabis2022',
      name: 'cannabis',
      prefix:'cannabis_'
    },
    pathImg :{
      pathTmp :"../upload/tmp",
      pathItem : "../../upload/img-items",
    },
    jwtSecret : "cain-api-dev",
    jwtSecretAdmin : "cain-api-admin",
   };
   
   
module.exports = config;
