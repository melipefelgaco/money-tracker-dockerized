const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function connectToDatabase() {
  try {
    console.log('Connecting to database...');
    const db = await mysql.createConnection({
      host: process.env.LOCAL_DB_HOST,
      user: process.env.LOCAL_DB_USER,
      password: process.env.LOCAL_DB_PASS,
      database: process.env.LOCAL_DB_NAME
    });
    console.log('Connected to the database');
    return db;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

module.exports = connectToDatabase;
