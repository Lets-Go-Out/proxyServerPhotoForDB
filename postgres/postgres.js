const dotenv = require('dotenv');
dotenv.config()

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  database: 'sdc',
  password: process.env.POSTGRESPASS,
  host: '34.219.196.170',
  port: 5432
});


module.exports = pool;
