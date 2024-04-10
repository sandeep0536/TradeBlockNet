const mysql = require("mysql");
const config = require("./../config/config");

//establishing connection with mysql
const connection = mysql.createConnection({
    host : config.DATABASE_HOST,
    user : config.DATABASE_USER,
    password : config.DATABASE_PASS,
    database : config.DATABASE_NAME
});

//connect with db server
connection.connect(function(error){
    if(error){
        console.log("Connection failed!")
    }
    console.log("connection established successfully");
})

//export connection
module.exports = connection;