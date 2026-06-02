const { Pool } = require("pg");

require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err) => {

  if (err) {

    console.log("Database connection failed");
    console.log(err);

    
  } else {

    console.log("Database connected successfully");
  }
});

module.exports = pool;