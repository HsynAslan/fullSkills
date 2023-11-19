// db.js

const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "pass123",
  database: "dbname",
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL Connection Error: ", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

module.exports = connection;
