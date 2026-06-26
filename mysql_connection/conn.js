const mysqlconnector= require('mysql2')
require('dotenv').config()


const con= mysqlconnector.createPool({
host:process.env.DBHOST,
user:process.env.DBUSER,
password:process.env.DBPASS,
database:process.env.DBNAME,
connectionLimit:20,
queueLimit:0




})



module.exports=con.promise()