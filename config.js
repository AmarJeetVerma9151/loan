
const config = {
    database: {
        dbConnectionString:process.env.MONGODB_CONNECTION_STRING || "mongodb://127.0.0.1:27017/loan"
    },
    http: {
        port: 8080
    },
    pagination:{
        limit:10,
        maxLimit:500
    },
    jwtSecret: {
        jwtSecret:process.env.JWT_SECRET || "santosh",
        expiresIn: "10d"
    },
      
    
};

module.exports = config;